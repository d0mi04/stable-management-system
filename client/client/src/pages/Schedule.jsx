import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import dayjs from "dayjs";
import "./GoogleCalendar.css";

const API_URL = process.env.REACT_APP_API_URL;

const GoogleCalendar = () => {
  const [events, setEvents] = useState([]);
  const [localEvents, setLocalEvents] = useState([]);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [token, setToken] = useState(null);
  
  const ownerId = localStorage.getItem("userId");

  const [newEvent, setNewEvent] = useState({
    summary: "",
    date: dayjs().format("YYYY-MM-DD"),
    time: "12:00",
  });

  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/calendar",
    onSuccess: (tokenResponse) => {
      setToken(tokenResponse.access_token);
      fetchGoogleEvents(tokenResponse.access_token);
    },
    onError: () => {
      setError("Błąd logowania");
    },
  });

  const fetchGoogleEvents = async (accessToken) => {
    try {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=2500",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!res.ok) throw new Error("Błąd pobierania wydarzeń Google");
      const data = await res.json();
      setEvents(data.items || []);
    } catch (err) {
      setError(err.message);
    }
  };



useEffect(() => {
  const fetchLocalEvents = async () => {
	  
	if (!ownerId) {
      setError("Brak ID użytkownika – zaloguj się.");
      return;
    }
	  
    const start = currentDate.startOf("month").startOf("week");
    const end = currentDate.endOf("month").endOf("week");

    const days = [];
    let day = start;

    while (day.isBefore(end, "day") || day.isSame(end, "day")) {
      days.push(day.toDate());
      day = day.add(1, "day");
    }

    try {
      const results = await Promise.all(
        days.map(async (d) => {
          const dateStr = d.toDateString(); 
          const res = await fetch(`${API_URL}events/${dateStr}/${ownerId}`);
          if (!res.ok) return [];
          const data = await res.json();
          return data;
        })
      );

      const flattened = results.flat();
      setLocalEvents(flattened);
    } catch (err) {
      setError("Błąd pobierania lokalnych wydarzeń");
    }
  };
  
  fetchLocalEvents();
}, [currentDate]);


  const addEvent = async () => {
    if (!token) return setError("Zaloguj się przez Google.");

    const dateTime = `${newEvent.date}T${newEvent.time}:00`;

    const event = {
      summary: newEvent.summary,
      start: { dateTime, timeZone: "Europe/Warsaw" },
      end: {
        dateTime: dayjs(dateTime).add(1, "hour").format("YYYY-MM-DDTHH:mm:ss"),
        timeZone: "Europe/Warsaw",
      },
    };

    try {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
      if (!res.ok) throw new Error("Błąd dodawania wydarzenia Google");
      const added = await res.json();
      setEvents((prev) => [...prev, added]);
      setNewEvent({ summary: "", date: dayjs().format("YYYY-MM-DD"), time: "12:00" });
    } catch (err) {
      setError(err.message);
    }
  };

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMonth.startOf("week");
  const endDay = endOfMonth.endOf("week");

  const days = [];
  let day = startDay;

  while (day.isBefore(endDay, "day") || day.isSame(endDay, "day")) {
    days.push(day);
    day = day.add(1, "day");
  }

  const googleEventsByDate = events.reduce((acc, event) => {
    const date = dayjs(event.start?.dateTime || event.start?.date).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const localEventsByDate = localEvents.reduce((acc, event) => {
    const date = dayjs(event.date).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});
  
  

  return (
    <div className="calendar-container">
      <button onClick={() => login()}>🔐 Zaloguj się przez Google</button>
      {error && <p className="error">{error}</p>}

      <div className="calendar-header">
        <button onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>⬅️</button>
        <h2>{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={() => setCurrentDate(currentDate.add(1, "month"))}>➡️</button>
      </div>

      <div className="calendar-grid">
        {["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"].map((d) => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}

        {days.map((day) => {
          const dateStr = day.format("YYYY-MM-DD");
          const gEvents = googleEventsByDate[dateStr] || [];
          const lEvents = localEventsByDate[dateStr] || [];

          return (
            <div
              key={dateStr}
              className={`calendar-cell ${day.month() !== currentDate.month() ? "other-month" : ""}`}
            >
              <div className="calendar-date">{day.date()}</div>

              {gEvents.map((e) => (
                <div key={e.id} className="event">
                  📅 {e.summary || "(Brak tytułu)"}
                </div>
              ))}

              {lEvents.map((e) => (
                <div key={e._id} className="event local-event">
                  🗂 {e.title} {e.horseId?.name ? `– ${e.horseId.name}` : ""}
                </div>

              ))}
            </div>
          );
        })}
      </div>

      <hr style={{ margin: "2em 0" }} />

      <h3>➕ Dodaj wydarzenie do Google</h3>
      <div className="add-event-form">
        <input
          type="text"
          placeholder="Tytuł"
          value={newEvent.summary}
          onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
        />
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
        />
        <input
          type="time"
          value={newEvent.time}
          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
        />
        <button onClick={addEvent}>Dodaj</button>
      </div>
    </div>
  );
};

export default GoogleCalendar;
