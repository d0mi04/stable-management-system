import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const API_URL = process.env.REACT_APP_API_URL;

const Schedule = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState("");
  const [horses, setHorses] = useState([]);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  


  const dateStr = date.toDateString();

  useEffect(() => {
    fetch(`${API_URL}horses`)
      .then(res => res.json())
      .then(data => {
        // jeśli backend zwraca { horses: [...] }
        const list = Array.isArray(data) ? data : data.horses || [];
        setHorses(list);
      })
      .catch(err => {
        console.error(err);
        setHorses([]);
      });
  }, []);

  // Pobierz wydarzenia dla wybranej daty
  useEffect(() => {
	const dateStr = date.toDateString();
    fetch(`${API_URL}events/${dateStr}`)
      .then((res) => res.json())
      .then(setEvents);
  }, [date]);

  const handleAddEvent = async () => {
    if (!newEvent.trim() || !selectedHorseId) return;
    const res = await fetch(`${API_URL}events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        date: dateStr, 
        title: newEvent,
        horseId: selectedHorseId 
      }),
    });
    const created = await res.json();
    setEvents((prev) => [...prev, created]);
    setNewEvent("");
    setSelectedHorseId("");
  };


  const handleRemoveEvent = async (id) => {
    await fetch(`${API_URL}events/${id}`, { method: "DELETE" });
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
            {ev.title} {ev.horseId?.name && `– ${ev.horseId.name}`}
            <button onClick={() => handleRemoveEvent(ev._id)} style={{ color: "red" }}>
              ❌
            </button>
          </li>
        ))}
      </ul>


      <select
        value={selectedHorseId}
        onChange={e => setSelectedHorseId(e.target.value)}
      >
      <option value="">-- Wybierz konia --</option>
        {(horses || []).map(horse => (
        <option key={horse._id} value={horse._id}>
          {horse.name}
      </option>
      ))}
      </select>

      <input
        type="text"
        placeholder="Opis wydarzenia"
        value={newEvent}
        onChange={(e) => setNewEvent(e.target.value)}
      />
        <button onClick={handleAddEvent}>Dodaj wydarzenie</button>
    </div>
  );
};

export default Schedule;