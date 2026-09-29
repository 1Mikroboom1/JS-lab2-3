import { readCachedReport, saveReport } from '../storage/repository.js';
import { geocodeCity, getForecast } from '../api/openMeteo.js';

export async function getCityReport(city, days, config, options = {}) {
  const { noCache = false, fetchImpl = fetch, today = new Date() } = options;
  const date = today.toISOString().slice(0, 10);

  if (!noCache) {
    const cached = await readCachedReport(city, date, config.reportsDir);
    if (cached) {
      return { ...cached, cached: true };
    }
  }

  const location = await geocodeCity(city, config, fetchImpl);
  const forecast = await getForecast(location, days, config, fetchImpl);

  const report = {
    requestedCity: city,
    city: location.name,
    country: location.country,
    coordinates: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    generatedAt: new Date().toISOString(),
    forecast,
  };

  await saveReport(report, city, date, config.reportsDir);

  return { ...report, cached: false };
}