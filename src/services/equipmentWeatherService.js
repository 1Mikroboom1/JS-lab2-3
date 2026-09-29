import { getForecast } from '../api/openMeteo.js';
import { apiConfig } from '../config/index.js';

export async function getEquipmentWeather(equipment) {
  const forecast = await getForecast(
    { latitude: equipment.location.lat, longitude: equipment.location.lon },
    3,
    {
      forecastBaseUrl: process.env.WEATHER_API_URL ?? 'https://api.open-meteo.com/v1/forecast',
      timeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 5000),
      temperatureUnit: process.env.TEMPERATURE_UNIT ?? 'celsius',
      precipitationUnit: process.env.PRECIPITATION_UNIT ?? 'mm',
    },
    fetch,
    { includeWind: true },
  );

  const suitableForOutdoorWork = forecast.days.every(
    (day) => Number(day.precipitation) === 0 && Number(day.windSpeed) <= apiConfig.windSpeedMax,
  );

  return {
    equipmentId: equipment.id,
    location: equipment.location,
    forecast: forecast.days,
    suitableForOutdoorWork,
    rule: `Окно пригодно, если нет осадков и максимальная скорость ветра не превышает ${apiConfig.windSpeedMax} км/ч.`,
    windSpeedMax: apiConfig.windSpeedMax,
  };
}
