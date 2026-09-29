import { fetchJson } from './http.js';

export async function geocodeCity(city, config, fetchImpl = fetch) {
  const url = new URL(config.geocodingBaseUrl);
  url.search = new URLSearchParams({
    name: city,
    count: '1',
    language: 'ru',
    format: 'json',
  }).toString();

  const data = await fetchJson(url, {
    timeoutMs: config.timeoutMs,
    fetchImpl,
  });

  const place = data?.results?.[0];
  if (!place) {
    throw new Error(`Город «${city}» не найден.`);
  }

  return {
    name: place.name,
    country: place.country ?? 'Неизвестная страна',
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

export async function getForecast(location, days, config, fetchImpl = fetch, options = {}) {
  const url = new URL(config.forecastBaseUrl);
  const params = {
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: options.includeWind ? 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max' : 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    forecast_days: String(days),
    timezone: 'auto',
  };

  if (config.temperatureUnit === 'fahrenheit') {
    params.temperature_unit = 'fahrenheit';
  }
  if (config.precipitationUnit === 'inch') {
    params.precipitation_unit = 'inch';
  }

  url.search = new URLSearchParams(params).toString();

  const data = await fetchJson(url, {
    timeoutMs: config.timeoutMs,
    fetchImpl,
  });

  if (
    !data?.daily?.time ||
    !Array.isArray(data.daily.time) ||
    !Array.isArray(data.daily.temperature_2m_min) ||
    !Array.isArray(data.daily.temperature_2m_max) ||
    !Array.isArray(data.daily.precipitation_sum) ||
    (options.includeWind && !Array.isArray(data.daily.wind_speed_10m_max))
  ) {
    throw new Error('API вернул прогноз в неожиданном формате.');
  }

  return {
    unitTemperature: data.daily_units?.temperature_2m_max ?? '°C',
    unitPrecipitation: data.daily_units?.precipitation_sum ?? 'mm',
    unitWindSpeed: options.includeWind ? (data.daily_units?.wind_speed_10m_max ?? 'km/h') : undefined,
    days: data.daily.time.map((date, index) => ({
      date,
      minTemperature: data.daily.temperature_2m_min[index],
      maxTemperature: data.daily.temperature_2m_max[index],
      precipitation: data.daily.precipitation_sum[index],
      ...(options.includeWind ? { windSpeed: data.daily.wind_speed_10m_max[index] } : {}),
    })),
  };
}