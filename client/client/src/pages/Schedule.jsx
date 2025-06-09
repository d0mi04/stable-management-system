import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const API_URL = "http://localhost:5000";

const Schedule = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState("");

  const dateStr = date.toDateString();

  // Pobierz wydarzenia dla wybranej daty
  useEffect(() => {
	const dateStr = date.toDateString();
    fetch(`${API_URL}/events/${dateStr}`)
      .then((res) => res.json())
      .then(setEvents);
  }, [date]);

  const handleAddEvent = async () => {
    if (!newEvent.trim()) return;
    const res = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr, title: newEvent }),
    });
    const created = await res.json();
    setEvents((prev) => [...prev, created]);
    setNewEvent("");
  };

  const handleRemoveEvent = async (id) => {
    await fetch(`${API_URL}/events/${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <div className="schedule-container">
      <h2>📅 Kalendarz koni</h2>
      <Calendar onChange={setDate} value={date} />
      <h3>Wydarzenia: {dateStr}</h3>

      <ul>
        {events.map((ev) => (
          <li key={ev._id}>
            {ev.title}{" "}
            <button onClick={() => handleRemoveEvent(ev._id)} style={{ color: "red" }}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="np. Koń – trening"
        value={newEvent}
        onChange={(e) => setNewEvent(e.target.value)}
      />
      <button onClick={handleAddEvent}>Dodaj wydarzenie</button>
    </div>
  );
};

export default Schedule;
