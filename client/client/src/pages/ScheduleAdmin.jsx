import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ScheduleAdmin.css";

const API_URL = process.env.REACT_APP_API_URL;
const WEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

const Schedule = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // Store all events for filtering
  const [monthEvents, setMonthEvents] = useState([]); // Events for calendar month view
  const [newEvent, setNewEvent] = useState("");
  const [newEventHour, setNewEventHour] = useState("09:00");
  const [newEventDuration, setNewEventDuration] = useState(1);
  const [newEventLocation, setNewEventLocation] = useState("Warszawa");
  const [filterLocation, setFilterLocation] = useState(""); // Filter by location
  const [filterHorse, setFilterHorse] = useState(""); // Filter by horse
  const [horses, setHorses] = useState([]);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(false);
  const [hoveredWeather, setHoveredWeather] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "list"

  const dateStr = date.toDateString();

  const token = localStorage.getItem("token");

  // Helper function to get event type classes
  const getEventTypeClasses = (event) => {
    if (event.title?.toLowerCase().includes('training')) {
      return 'bg-blue-50 border-blue-400';
    } else if (event.title?.toLowerCase().includes('vet') || event.title?.toLowerCase().includes('health')) {
      return 'bg-red-50 border-red-400';
    } else if (event.title?.toLowerCase().includes('grooming')) {
      return 'bg-green-50 border-green-400';
    } else if (event.title?.toLowerCase().includes('feeding')) {
      return 'bg-yellow-50 border-yellow-400';
    }
    return 'bg-gray-50 border-gray-400';
  };

  // Filter events based on selected filters
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      const matchesLocation = !filterLocation || event.location === filterLocation;
      const matchesHorse = !filterHorse || event.horseId === filterHorse;
      return matchesLocation && matchesHorse;
    });
  }, [events, filterLocation, filterHorse]);

  // Get unique locations for filter dropdown
  const uniqueLocations = React.useMemo(() => {
    const locations = [...new Set(allEvents.map(event => event.location).filter(Boolean))];
    return locations.sort();
  }, [allEvents]);

  // Get events for a specific date (for calendar indicators)
  const getEventsForDate = (checkDate) => {
    const checkDateStr = checkDate.toDateString();
    return monthEvents.filter(event => new Date(event.date).toDateString() === checkDateStr);
  };

  // Fetch events for entire month (for calendar indicators)
  const fetchMonthEvents = async (currentDate) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    try {
      const res = await fetch(`${API_URL}events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      setMonthEvents(data || []);
    } catch (err) {
      console.error("Failed to fetch month events:", err);
    }
  };

  // Custom tile content for calendar
  const tileContent = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(tileDate);
      const hasEvents = dayEvents.length > 0;
      
      return (
        <div className="flex justify-center mt-1">
          <div 
            className={`w-2 h-2 rounded-full ${
              hasEvents 
                ? 'bg-indigo-500 animate-pulse' 
                : 'bg-gray-300'
            }`}
          />
        </div>
      );
    }
    return null;
  };

  // Format duration for display
  const formatDuration = (duration) => {
    if (duration === 12) return "All day";
    if (duration === 0.5) return "30min";
    if (duration === 1) return "1h";
    if (duration === 1.5) return "1.5h";
    return `${duration}h`;
  };

  // Polish cities mapping for OpenWeatherMap API
  // The API supports city names with country codes for better accuracy
  const cityMapping = {
    Krakow: "Krakow,PL",
    Gdansk: "Gdansk,PL",
    Warszawa: "Warsaw,PL",
    Poznan: "Poznan,PL",
    Wroclaw: "Wroclaw,PL",
  };

  // Weather emoji mapping
  const getWeatherEmoji = (weatherMain, description) => {
    const weatherMap = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Fog: "🌫️",
      Haze: "🌫️",
    };
    return weatherMap[weatherMain] || "🌤️";
  };

  // Convert wind direction degrees to compass direction
  const getWindDirection = (degrees) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  // Weather Tooltip Component
  const WeatherTooltip = ({ weather, isVisible, position }) => {
    if (!isVisible || !weather) return null;

    // Capitalize first letter of description
    const capitalizeDescription = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
      <div
        className="absolute z-50 bg-white border border-purple-200 rounded-lg shadow-xl p-6 text-sm max-w-lg"
        style={{
          left: position?.x || 0,
          top: position?.y || 0,
          transform: "translateX(-50%) translateY(-100%)",
        }}
      >
        <div className="font-semibold text-purple-900 mb-4 flex items-center text-base">
          {getWeatherEmoji(weather.main)}{" "}
          {capitalizeDescription(weather.description)}
        </div>

        {weather.training_period && (
          <div className="mb-4 text-center">
            <div className="text-xs text-purple-600 font-medium">
              Training Period
            </div>
            <div className="text-sm text-purple-800">
              {weather.training_period}
            </div>
            {weather.forecast_time && (
              <div className="text-xs text-purple-500 mt-1">
                Forecast for: {weather.forecast_time}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 text-purple-700">
          <div className="text-center">
            <span className="text-purple-600 block text-xs">
              🌡️ Temperature
            </span>
            <div className="font-medium text-lg">{weather.temp}°C</div>
          </div>

          <div className="text-center">
            <span className="text-purple-600 block text-xs">🤲 Feels like</span>
            <div className="font-medium text-lg">{weather.feels_like}°C</div>
          </div>

          <div className="text-center">
            <span className="text-purple-600 block text-xs">💧 Humidity</span>
            <div className="font-medium text-lg">{weather.humidity}%</div>
          </div>

          <div className="text-center">
            <span className="text-purple-600 block text-xs">🌬️ Wind</span>
            <div className="font-medium text-lg">{weather.wind_speed} m/s</div>
            {weather.wind_direction && (
              <div className="text-xs text-purple-500">
                {getWindDirection(weather.wind_direction)}
              </div>
            )}
          </div>

          <div className="text-center">
            <span className="text-purple-600 block text-xs">📊 Min/Max</span>
            <div className="font-medium text-sm">
              {weather.temp_min}°C / {weather.temp_max}°C
            </div>
          </div>

          <div className="text-center">
            <span className="text-purple-600 block text-xs">⏳ Pressure</span>
            <div className="font-medium text-sm">{weather.pressure} hPa</div>
          </div>

          {weather.clouds > 0 ? (
            <div className="text-center">
              <span className="text-purple-600 block text-xs">☁️ Clouds</span>
              <div className="font-medium text-sm">{weather.clouds}%</div>
            </div>
          ) : weather.visibility ? (
            <div className="text-center">
              <span className="text-purple-600 block text-xs">
                👁️ Visibility
              </span>
              <div className="font-medium text-sm">{weather.visibility} km</div>
            </div>
          ) : (
            <div></div>
          )}

          {weather.rain > 0 ? (
            <div className="text-center">
              <span className="text-purple-600 block text-xs">🌧️ Rain</span>
              <div className="font-medium text-sm">{weather.rain} mm</div>
            </div>
          ) : weather.snow > 0 ? (
            <div className="text-center">
              <span className="text-purple-600 block text-xs">❄️ Snow</span>
              <div className="font-medium text-sm">{weather.snow} mm</div>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    );
  };

  // Check if date is within 5 days
  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(0, 0, 0, 0);
    const diffTime = eventDateTime - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Fetch weather data using OpenWeatherMap 5-day forecast API
  // API provides forecasts every 3 hours for up to 5 days ahead
  const fetchWeatherData = async (
    eventDate,
    eventLocation = "Warszawa",
    eventHour = "09:00",
    eventDuration = 1
  ) => {
    if (
      !WEATHER_API_KEY ||
      WEATHER_API_KEY === "your_openweather_api_key_here"
    ) {
      console.warn(
        "OpenWeatherMap API key not configured. Please add your API key to .env file."
      );
      return null;
    }

    const daysUntil = getDaysUntilEvent(eventDate);

    // 5-day forecast API provides data for up to 5 days ahead
    if (daysUntil > 5) {
      return { daysUntilAvailable: Math.abs(daysUntil - 5) };
    }

    try {
      // Use the event's location - API supports city name or coordinates
      const location = cityMapping[eventLocation] || "Warsaw,PL";

      // OpenWeatherMap 5-day forecast API with 3-hour intervals
      // cnt=40 gives us 5 days * 8 forecasts per day (every 3 hours)
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${WEATHER_API_KEY}&units=metric&cnt=40`
      );

      if (!response.ok) {
        throw new Error(
          `Weather API responded with status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.cod === "200") {
        // Convert event time to target timestamp
        const eventDateObj = new Date(eventDate);
        const [hours, minutes] = eventHour.split(":").map(Number);

        // Create event start time with proper date and time
        const eventStartTime = new Date(
          eventDateObj.getFullYear(),
          eventDateObj.getMonth(),
          eventDateObj.getDate(),
          hours,
          minutes,
          0,
          0
        );

        // Calculate event end time
        const eventEndTime = new Date(eventStartTime);
        eventEndTime.setTime(
          eventStartTime.getTime() + eventDuration * 60 * 60 * 1000
        );

        // Find forecasts that overlap with the event period
        // OpenWeatherMap 5-day forecast provides data every 3 hours
        const relevantForecasts = data.list.filter((item) => {
          const forecastTime = new Date(item.dt * 1000);
          const forecastEndTime = new Date(
            forecastTime.getTime() + 3 * 60 * 60 * 1000
          ); // Each forecast covers 3 hours

          // Check if forecast period overlaps with event period
          return (
            forecastTime <= eventEndTime && forecastEndTime >= eventStartTime
          );
        });

        let selectedForecast;

        if (relevantForecasts.length > 0) {
          // Use the forecast that best matches the event start time
          selectedForecast = relevantForecasts.reduce((best, current) => {
            const currentTime = new Date(current.dt * 1000);
            const bestTime = new Date(best.dt * 1000);

            return Math.abs(currentTime - eventStartTime) <
              Math.abs(bestTime - eventStartTime)
              ? current
              : best;
          });
        } else {
          // Fallback: find the closest forecast on the same day
          const targetDateStr = eventStartTime.toISOString().split("T")[0];
          const sameDayForecasts = data.list.filter((item) =>
            item.dt_txt.startsWith(targetDateStr)
          );

          if (sameDayForecasts.length > 0) {
            selectedForecast = sameDayForecasts.reduce((best, current) => {
              const currentTime = new Date(current.dt * 1000);
              const bestTime = new Date(best.dt * 1000);

              return Math.abs(currentTime - eventStartTime) <
                Math.abs(bestTime - eventStartTime)
                ? current
                : best;
            });
          } else {
            // Final fallback: use the closest available forecast
            selectedForecast = data.list.reduce((best, current) => {
              const currentTime = new Date(current.dt * 1000);
              const bestTime = new Date(best.dt * 1000);

              return Math.abs(currentTime - eventStartTime) <
                Math.abs(bestTime - eventStartTime)
                ? current
                : best;
            });
          }
        }

        return {
          temp: Math.round(selectedForecast.main.temp),
          temp_min: Math.round(selectedForecast.main.temp_min),
          temp_max: Math.round(selectedForecast.main.temp_max),
          feels_like: Math.round(selectedForecast.main.feels_like),
          humidity: selectedForecast.main.humidity,
          pressure: selectedForecast.main.pressure,
          description: selectedForecast.weather[0].description,
          main: selectedForecast.weather[0].main,
          wind_speed: Math.round(selectedForecast.wind.speed * 10) / 10,
          wind_direction: selectedForecast.wind.deg,
          clouds: selectedForecast.clouds.all,
          visibility: selectedForecast.visibility
            ? Math.round(selectedForecast.visibility / 1000)
            : null,
          rain: selectedForecast.rain ? selectedForecast.rain["3h"] || 0 : 0,
          snow: selectedForecast.snow ? selectedForecast.snow["3h"] || 0 : 0,
          forecast_time: new Date(
            selectedForecast.dt * 1000
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          training_period: `${eventHour} - ${new Date(
            eventEndTime
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}`,
        };
      } else {
        throw new Error(`Weather API error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  };

  // Filter events by location and horse
  const filterEvents = (eventsData) => {
    let filtered = eventsData;

    // Filter by location
    if (filterLocation) {
      filtered = filtered.filter((event) => event.location === filterLocation);
    }

    // Filter by horse
    if (filterHorse) {
      filtered = filtered.filter((event) => event.horseId?._id === filterHorse);
    }

    return filtered;
  };

  useEffect(() => {
    // Close tooltip when clicking outside
    const handleClickOutside = () => {
      setHoveredWeather(null);
    };

    if (hoveredWeather) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [hoveredWeather]);

  // Apply filters when filterLocation or filterHorse changes
  useEffect(() => {
    const filteredEvents = filterEvents(allEvents);
    setEvents(filteredEvents);
  }, [filterLocation, filterHorse, allEvents]);

  useEffect(() => {
    // Fetch horses
    fetch(`${API_URL}horses`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.horses || [];
        setHorses(list);
      })
      .catch((err) => {
        console.error(err);
        setHorses([]);
      });

    // Fetch month events for calendar indicators
    fetchMonthEvents(date);
  }, [token, date]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}events/${dateStr}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => res.json())
      .then(async (eventsData) => {
        setAllEvents(eventsData); // Store all events
        const filteredEvents = filterEvents(eventsData);
        setEvents(filteredEvents);

        // Fetch weather data for each event
        const weatherPromises = eventsData.map(async (event) => {
          const weather = await fetchWeatherData(
            event.date,
            event.location,
            event.hour,
            event.duration
          );
          return { eventId: event._id, weather };
        });

        const weatherResults = await Promise.all(weatherPromises);
        const weatherMap = {};
        weatherResults.forEach(({ eventId, weather }) => {
          weatherMap[eventId] = weather;
        });

        setWeatherData(weatherMap);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [date, token, dateStr]);

  const handleAddEvent = async () => {
    if (!newEvent.trim() || !selectedHorseId) return;
    const res = await fetch(`${API_URL}events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        date: dateStr,
        title: newEvent,
        hour: newEventHour,
        duration: newEventDuration,
        location: newEventLocation,
        horseId: selectedHorseId,
      }),
    });
    const created = await res.json();

    // Add to all events
    setAllEvents((prev) => [...prev, created]);

    // Add to filtered events if it matches the current filters
    const newAllEvents = [...allEvents, created];
    const filteredEvents = filterEvents(newAllEvents);
    if (filteredEvents.some((event) => event._id === created._id)) {
      setEvents((prev) => [...prev, created]);
    }

    // Fetch weather for new event
    const weather = await fetchWeatherData(
      created.date,
      created.location,
      created.hour,
      created.duration
    );
    setWeatherData((prev) => ({ ...prev, [created._id]: weather }));

    setNewEvent("");
    setNewEventHour("09:00");
    setNewEventDuration(1);
    setNewEventLocation("Warszawa");
    setSelectedHorseId("");
	
    // Szukanie konia i właściciela
    const selectedHorse = horses.find(h => h._id === selectedHorseId);
    const email = selectedHorse?.ownerEmail;
    const horseName = selectedHorse?.name;

    // Formatowanie daty jako DD-MM-YYYY
    const d = new Date(date);
    const formattedDate = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

    // Wysłanie requesta do email API
    if (email && horseName) {
      const emailUrl = `https://send-email-381376669818.europe-west1.run.app?email=${encodeURIComponent(email)}&horseName=${encodeURIComponent(horseName)}&date=${encodeURIComponent(formattedDate)}&event=${encodeURIComponent(newEvent)}`;

      try {
        await fetch(emailUrl);
      } catch (err) {
        console.error("Błąd podczas wysyłania e-maila:", err);
      }
    }
  };

  const handleRemoveEvent = async (id) => {
    await fetch(`${API_URL}events/${id}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    setAllEvents((prev) => prev.filter((e) => e._id !== id));
    setEvents((prev) => prev.filter((e) => e._id !== id));
    setWeatherData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  };

  // Event Form Component
  const EventForm = ({ onSave, onCancel }) => {
    const [form, setForm] = useState({
      title: "",
      hour: "09:00",
      duration: 1,
      location: "Warszawa",
      horseId: "",
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.title.trim() || !form.horseId) {
        alert("Event title and horse selection are required.");
        return;
      }

      const res = await fetch(`${API_URL}events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          date: dateStr,
          title: form.title,
          hour: form.hour,
          duration: form.duration,
          location: form.location,
          horseId: form.horseId,
        }),
      });
      const created = await res.json();

      // Add to all events
      setAllEvents((prev) => [...prev, created]);
      setEvents((prev) => [...prev, created]);

      // Fetch weather for new event
      const weather = await fetchWeatherData(
        created.date,
        created.location,
        created.hour,
        created.duration
      );
      setWeatherData((prev) => ({ ...prev, [created._id]: weather }));

      // Send email notification
      const selectedHorse = horses.find(h => h._id === form.horseId);
      const email = selectedHorse?.ownerEmail;
      const horseName = selectedHorse?.name;

      if (email && horseName) {
        const d = new Date(date);
        const formattedDate = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        
        try {
          const emailUrl = `https://send-email-381376669818.europe-west1.run.app?email=${encodeURIComponent(email)}&horseName=${encodeURIComponent(horseName)}&date=${encodeURIComponent(formattedDate)}&event=${encodeURIComponent(form.title)}`;
          await fetch(emailUrl);
        } catch (err) {
          console.error("Error sending email:", err);
        }
      }

      onSave();
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-center text-indigo-700">
              Create New Event
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Select Horse</label>
              <select
                name="horseId"
                value={form.horseId}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">-- Select Horse --</option>
                {horses.map((horse) => (
                  <option key={horse._id} value={horse._id}>
                    {horse.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Event Description</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter event description..."
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Time</label>
                <input
                  type="time"
                  name="hour"
                  value={form.hour}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Duration</label>
                <select
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value={0.5}>30 minutes</option>
                  <option value={1}>1 hour</option>
                  <option value={1.5}>1.5 hours</option>
                  <option value={2}>2 hours</option>
                  <option value={2.5}>2.5 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4 hours</option>
                  <option value={6}>6 hours</option>
                  <option value={8}>8 hours</option>
                  <option value={12}>All day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="Warszawa">Warszawa</option>
                  <option value="Krakow">Kraków</option>
                  <option value="Gdansk">Gdańsk</option>
                  <option value="Poznan">Poznań</option>
                  <option value="Wroclaw">Wrocław</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-150"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Management</h1>
          <p className="text-gray-600">Manage events and track weather conditions for optimal planning</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Schedule</h2>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-1 rounded-md transition duration-150 text-sm font-medium ${
                    viewMode === "calendar"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  📅 Calendar
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded-md transition duration-150 text-sm font-medium ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  📋 List
                </button>
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-150 ease-in-out flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Event
              </button>
            </div>
          </div>

          {/* Weather Status */}
          {(!WEATHER_API_KEY || WEATHER_API_KEY === "your_openweather_api_key_here") && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.168 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-yellow-800 font-medium">Weather setup required</span>
              </div>
            </div>
          )}

          {/* View Mode Content */}
          <div className="transition-all duration-300 ease-in-out">
            {viewMode === "calendar" ? (
              /* Calendar View */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Select Date
                  </h3>
                  <Calendar
                    onChange={setDate}
                    value={date}
                    className="w-full"
                    locale="en-US"
                    tileContent={tileContent}
                    navigationLabel={({ date, view, label }) => {
                      return view === "month"
                        ? date.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : label;
                    }}
                    formatShortWeekday={(locale, date) => {
                      return date
                        .toLocaleDateString("en-US", { weekday: "short" })
                        .substr(0, 3);
                    }}
                    formatMonthYear={(locale, date) => {
                      return date.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      });
                    }}
                  />
                </div>

                {/* Selected Date Events */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Events for {dateStr}
                  </h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading events...</p>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No events scheduled for this date</p>
                      <p className="text-gray-400 text-sm">Click "Add Event" to create one</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredEvents.slice(0, 3).map((event) => (
                        <div key={event._id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">{event.title}</h4>
                              <p className="text-sm text-gray-600">
                                🕐 {event.hour || "09:00"} ({formatDuration(event.duration || 1)})
                              </p>
                              <p className="text-sm text-gray-600">
                                🐎 {event.horseId?.name || "No assignment"}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveEvent(event._id)}
                              className="text-red-600 hover:text-red-800 transition duration-150"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      {filteredEvents.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{filteredEvents.length - 3} more events. Switch to List view to see all.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* List View */
              <div>
                {/* Filters */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Location
                      </label>
                      <select
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      >
                        <option value="">All Locations</option>
                        {uniqueLocations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Horse
                      </label>
                      <select
                        value={filterHorse}
                        onChange={(e) => setFilterHorse(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      >
                        <option value="">All Horses</option>
                        {horses.map((horse) => (
                          <option key={horse._id} value={horse._id}>
                            {horse.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(filterLocation || filterHorse) && (
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setFilterLocation("");
                            setFilterHorse("");
                          }}
                          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                  {(filterLocation || filterHorse) && (
                    <p className="text-sm text-gray-500">
                      Showing {filteredEvents.length} of {events.length} events for {dateStr}
                      {filterLocation && ` in ${filterLocation}`}
                      {filterHorse && ` for ${horses.find(h => h._id === filterHorse)?.name || 'selected horse'}`}
                    </p>
                  )}
                </div>

                {/* Events Grid */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading events...</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">
                      {(filterLocation || filterHorse) ? "No events match your filters" : "No events found for this date"}
                    </p>
                    <p className="text-gray-400">
                      {(filterLocation || filterHorse) ? "Try adjusting your filter settings" : "Create your first event to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => {
                      const weather = weatherData[event._id];
                      const daysUntil = getDaysUntilEvent(event.date);

                      return (
                        <div key={event._id} className={`border-l-4 rounded-lg p-4 hover:shadow-md transition duration-150 ${getEventTypeClasses(event)}`}>
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRemoveEvent(event._id)}
                                className="text-red-600 hover:text-red-800 transition duration-150"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Time:</span> {event.hour || "09:00"} ({formatDuration(event.duration || 1)})</p>
                            <p><span className="font-medium">Location:</span> {event.location || "Warszawa"}</p>
                            <p><span className="font-medium">Horse:</span> {event.horseId?.name || "No assignment"}</p>
                            {weather && weather.temp && (
                              <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                                <span className="font-medium">Weather:</span>
                                <div
                                  className="flex items-center space-x-1 cursor-help"
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredWeather({
                                      data: weather,
                                      position: {
                                        x: rect.left + rect.width / 2,
                                        y: rect.top,
                                      },
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredWeather(null)}
                                >
                                  <span className="text-lg">{getWeatherEmoji(weather.main, weather.description)}</span>
                                  <span>{weather.temp}°C</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Event Form Modal */}
        {showForm && (
          <EventForm
            onSave={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Weather Tooltip */}
        {hoveredWeather && (
          <WeatherTooltip
            weather={hoveredWeather.data}
            isVisible={true}
            position={hoveredWeather.position}
          />
        )}
      </div>
    </div>
  );
};

export default Schedule;