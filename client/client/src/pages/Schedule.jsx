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
  <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 to-indigo-200 py-10">
    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        Kalendarz wydarzeń
      </h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => login()}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          🔐 Zaloguj się przez Google
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-center mb-4 font-semibold">{error}</p>
      )}

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
          className="text-indigo-600 hover:text-indigo-800 font-bold text-xl"
          aria-label="Poprzedni miesiąc"
        >
          ⬅️
        </button>
        <h3 className="text-xl font-semibold text-gray-700">
          {currentDate.format("MMMM YYYY")}
        </h3>
        <button
          onClick={() => setCurrentDate(currentDate.add(1, "month"))}
          className="text-indigo-600 hover:text-indigo-800 font-bold text-xl"
          aria-label="Następny miesiąc"
        >
          ➡️
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-4 text-sm font-semibold text-gray-600 select-none">
        {["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = day.format("YYYY-MM-DD");
          const gEvents = googleEventsByDate[dateStr] || [];
          const lEvents = localEventsByDate[dateStr] || [];

          return (
            <div
              key={dateStr}
              className={`border rounded p-2 h-40 flex flex-col ${
                day.month() !== currentDate.month()
                  ? "bg-gray-50 text-gray-400"
                  : "bg-white"
              }`}
            >
              <div className="font-semibold mb-1">{day.date()}</div>

              <div className="overflow-auto text-xs space-y-1 flex-1">
                {gEvents.map((e) => (
                  <div key={e.id} className="bg-indigo-100 text-indigo-800 rounded px-1">
                    📅 {e.summary || "(Brak tytułu)"}
                  </div>
                ))}

                {lEvents.map((e) => (
                  <div
                    key={e._id}
                    className="bg-green-100 text-green-800 rounded px-1"
                    title={`Wydarzenie: ${e.title}`}
                  >
                    🗂 {e.title} {e.horseId?.name ? `– ${e.horseId.name}` : ""}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <hr className="my-8 border-gray-300" />

      <h3 className="text-2xl font-semibold text-indigo-700 mb-4">
        ➕ Dodaj wydarzenie do Google
      </h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addEvent();
        }}
        className="space-y-4 max-w-md mx-auto"
      >
        <input
          type="text"
          placeholder="Tytuł"
          value={newEvent.summary}
          onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          autoFocus
        />
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="time"
          value={newEvent.time}
          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition duration-200"
        >
          Dodaj
        </button>
      </form>
    </div>
  </div>
  );
};

export default GoogleCalendar;
