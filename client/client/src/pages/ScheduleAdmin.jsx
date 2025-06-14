import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ScheduleAdmin.css";

const API_URL = process.env.REACT_APP_API_URL;
const WEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

const Schedule = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState("");
  const [newEventHour, setNewEventHour] = useState("09:00");
  const [newEventLocation, setNewEventLocation] = useState("Warszawa");
  const [newEventDuration, setNewEventDuration] = useState(1);
  const [horses, setHorses] = useState([]);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(false);
  const [hoveredWeather, setHoveredWeather] = useState(null);

  const dateStr = date.toDateString();

  const token = localStorage.getItem("token");

  // Polish cities mapping for weather API
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

  // Format duration for display
  const formatDuration = (duration) => {
    if (!duration) return "(1h)";

    if (duration >= 12) {
      return <span className="text-gray-500 text-xs">(All day)</span>;
    }

    if (duration < 1) {
      return `(${Math.round(duration * 60)}min)`;
    }

    if (duration % 1 === 0) {
      return `(${duration}h)`;
    }

    return `(${duration}h)`;
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
          top: (position?.y || 0) - 20,
          transform: "translateX(-50%) translateY(-100%)",
        }}
      >
        <div className="font-semibold text-purple-900 mb-4 flex items-center text-base">
          {getWeatherEmoji(weather.main)}{" "}
          {capitalizeDescription(weather.description)}
        </div>

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

  // Fetch weather data
  const fetchWeatherData = async (eventDate, eventLocation = "Warszawa") => {
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

    if (daysUntil > 5) {
      return { daysUntilAvailable: Math.abs(daysUntil - 5) };
    }

    try {
      // Use the event's location
      const location = cityMapping[eventLocation] || "Warsaw,PL";
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
        // Find forecast for the specific date
        const targetDate = new Date(eventDate).toISOString().split("T")[0];
        const forecast =
          data.list.find((item) => item.dt_txt.includes(targetDate)) ||
          data.list[0]; // Fallback to first available forecast

        return {
          temp: Math.round(forecast.main.temp),
          temp_min: Math.round(forecast.main.temp_min),
          temp_max: Math.round(forecast.main.temp_max),
          feels_like: Math.round(forecast.main.feels_like),
          humidity: forecast.main.humidity,
          pressure: forecast.main.pressure,
          description: forecast.weather[0].description,
          main: forecast.weather[0].main,
          wind_speed: Math.round(forecast.wind.speed * 10) / 10,
          wind_direction: forecast.wind.deg,
          clouds: forecast.clouds.all,
          visibility: forecast.visibility
            ? Math.round(forecast.visibility / 1000)
            : null,
          rain: forecast.rain ? forecast.rain["3h"] || 0 : 0,
          snow: forecast.snow ? forecast.snow["3h"] || 0 : 0,
        };
      } else {
        throw new Error(`Weather API error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
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

  useEffect(() => {
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
  }, [token]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}events/${dateStr}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => res.json())
      .then(async (eventsData) => {
        setEvents(eventsData);

        // Fetch weather data for each event
        const weatherPromises = eventsData.map(async (event) => {
          const weather = await fetchWeatherData(event.date, event.location);
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
        location: newEventLocation,
        duration: newEventDuration,
        horseId: selectedHorseId,
      }),
    });
    const created = await res.json();
    setEvents((prev) => [...prev, created]);

    // Fetch weather for new event
    const weather = await fetchWeatherData(created.date, created.location);
    setWeatherData((prev) => ({ ...prev, [created._id]: weather }));

    setNewEvent("");
    setNewEventHour("09:00");
    setNewEventLocation("Warszawa");
    setNewEventDuration(1);
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
    setEvents((prev) => prev.filter((e) => e._id !== id));
    setWeatherData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-purple-900 mb-8 flex items-center justify-between">
          <span>📅 Horse Calendar</span>
          {!WEATHER_API_KEY ||
          WEATHER_API_KEY === "your_openweather_api_key_here" ? (
            <div className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
              ⚠️ Weather setup required
            </div>
          ) : (
            <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
              🌤️ Weather active
            </div>
          )}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">
              Select Date
            </h3>
            <Calendar
              onChange={setDate}
              value={date}
              className="w-full"
              locale="en-US"
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

          {/* Add Event Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">
              Add New Event
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Select Horse
                </label>
                <select
                  value={selectedHorseId}
                  onChange={(e) => setSelectedHorseId(e.target.value)}
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900"
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
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Event Description
                </label>
                <input
                  type="text"
                  placeholder="Enter event description..."
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEventHour}
                    onChange={(e) => setNewEventHour(e.target.value)}
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">
                    Location
                  </label>
                  <select
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900"
                  >
                    <option value="Warszawa">Warszawa</option>
                    <option value="Krakow">Kraków</option>
                    <option value="Gdansk">Gdańsk</option>
                    <option value="Poznan">Poznań</option>
                    <option value="Wroclaw">Wrocław</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-2">
                    Duration (hours)
                  </label>
                  <select
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900"
                  >
                    <option value={0.5}>30 min</option>
                    <option value={1}>1 hour</option>
                    <option value={1.5}>1.5 hours</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={6}>6 hours</option>
                    <option value={8}>8 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>All day</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddEvent}
                disabled={!newEvent.trim() || !selectedHorseId}
                className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-purple-700 text-white px-6 py-4">
            <h3 className="text-xl font-semibold">Events for: {dateStr}</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-purple-600">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-purple-600">
              <p className="text-lg">No events for the selected day</p>
              <p className="text-sm">Use the form above to add a new event</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                      Time & Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                      Horse
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">
                      Weather
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {events.map((event) => {
                    const weather = weatherData[event._id];
                    const daysUntil = getDaysUntilEvent(event.date);

                    return (
                      <tr
                        key={event._id}
                        className="hover:bg-purple-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-purple-900">
                          <div className="font-medium">{event.title}</div>
                        </td>
                        <td className="px-6 py-4 text-purple-800">
                          <div className="text-sm">
                            <div className="font-medium flex items-center gap-2">
                              🕐 {event.hour || "09:00"}
                              <span className={`${event.duration >= 12 ? 'text-gray-500 text-xs' : 'text-purple-500'}`}>
                                {formatDuration(event.duration)}
                              </span>
                            </div>
                            <div className="text-purple-600">
                              📍 {event.location || "Warszawa"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-purple-800">
                          {event.horseId?.name || "No assignment"}
                        </td>
                        <td className="px-6 py-4">
                          {!WEATHER_API_KEY ||
                          WEATHER_API_KEY ===
                            "your_openweather_api_key_here" ? (
                            <div className="text-purple-600 text-sm">
                              🔧 Configure API key
                            </div>
                          ) : weather ? (
                            weather.daysUntilAvailable ? (
                              <div className="text-purple-600 text-sm">
                                🔮 Forecast available in{" "}
                                {weather.daysUntilAvailable} days
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 relative">
                                <div
                                  className="text-2xl cursor-help hover:scale-110 transition-transform select-none"
                                  onMouseEnter={(e) => {
                                    const rect =
                                      e.target.getBoundingClientRect();
                                    setHoveredWeather({
                                      data: weather,
                                      position: {
                                        x: rect.left + rect.width / 2,
                                        y: rect.top,
                                      },
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredWeather(null)}
                                  onClick={(e) => {
                                    // For mobile devices - toggle tooltip on click
                                    e.preventDefault();
                                    if (hoveredWeather) {
                                      setHoveredWeather(null);
                                    } else {
                                      const rect =
                                        e.target.getBoundingClientRect();
                                      setHoveredWeather({
                                        data: weather,
                                        position: {
                                          x: rect.left + rect.width / 2,
                                          y: rect.top,
                                        },
                                      });
                                    }
                                  }}
                                >
                                  {getWeatherEmoji(
                                    weather.main,
                                    weather.description
                                  )}
                                </div>
                                <div className="text-sm text-purple-700">
                                  <div className="font-medium">
                                    {weather.temp}°C
                                  </div>
                                  <div className="text-xs capitalize">
                                    {weather.description
                                      .charAt(0)
                                      .toUpperCase() +
                                      weather.description.slice(1)}
                                  </div>
                                  <div className="text-xs text-purple-500">
                                    {weather.feels_like}°C • {weather.humidity}%
                                    • {weather.wind_speed}m/s
                                  </div>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="text-gray-400 text-sm">
                              {daysUntil > 5
                                ? `Forecast available in ${daysUntil - 5} days`
                                : "❌ Error fetching data"}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleRemoveEvent(event._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1 mx-auto"
                          >
                            <span className="text-sm">Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Weather Tooltip */}
      {hoveredWeather && (
        <WeatherTooltip
          weather={hoveredWeather.data}
          isVisible={true}
          position={hoveredWeather.position}
        />
      )}
    </div>
  );
};

export default Schedule;
