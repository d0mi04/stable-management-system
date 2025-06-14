# Weather Integration Setup

The ScheduleAdmin component now includes weather forecast functionality using the OpenWeatherMap API.

## Features

- **Weather Forecast**: Shows weather predictions for events up to 5 days in advance
- **Weather Icons**: Displays emoji-based weather icons for quick visual reference
- **Detailed Information**: Hover over weather icons to see detailed information including:
  - Temperature (actual and feels-like)
  - Humidity percentage
  - Wind speed
  - Weather description
- **Smart Fallbacks**: For events more than 5 days away, shows when forecast will be available

## Setup Instructions

### 1. Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to "API keys" section
4. Generate a new API key
5. Copy the API key

### 2. Configure Environment Variables

1. Open `/client/client/.env` file
2. Replace `your_openweather_api_key_here` with your actual API key:

```env
REACT_APP_API_URL=http://localhost:5000/
REACT_APP_OPENWEATHER_API_KEY=your_actual_api_key_here
```

### 3. Customize Location (Optional)

By default, the weather forecast uses Warsaw, Poland. To change the location:

1. Open `src/pages/ScheduleAdmin.jsx`
2. Find the line: `const location = 'Warsaw,PL';`
3. Replace with your desired location (e.g., `'London,UK'`, `'New York,US'`)

### 4. Restart the Application

After updating the .env file, restart your React development server:

```bash
cd client/client
npm start
```

## Weather Icon Mapping

The component uses emoji icons to represent different weather conditions:

- ☀️ Clear skies
- ☁️ Cloudy
- 🌧️ Rain
- 🌦️ Drizzle
- ⛈️ Thunderstorm
- ❄️ Snow
- 🌫️ Mist/Fog/Haze
- 🌤️ Default/Other conditions

## API Limitations

- Free OpenWeatherMap accounts are limited to 60 calls per minute and 1,000 calls per day
- Weather forecasts are available up to 5 days in advance
- The component automatically handles API rate limits and errors gracefully

## Troubleshooting

### "Konfiguracja pogody wymagana" Message

This means the API key is not properly configured. Ensure you've:

1. Added a valid API key to the .env file
2. Restarted the React development server
3. The API key is not the placeholder text

### "Błąd pobierania danych" Message

This indicates an API error. Check:

1. Your internet connection
2. API key validity
3. API rate limits
4. Browser console for detailed error messages

### Weather Not Showing for Today's Events

Weather forecasts might not be available for the current day depending on the API response. The component will show appropriate fallback messages.
