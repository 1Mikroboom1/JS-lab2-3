const positiveNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const apiConfig = {
  port: positiveNumber(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map((x) => x.trim()).filter(Boolean),
  rateLimitWindowMs: positiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  rateLimitMax: positiveNumber(process.env.RATE_LIMIT_MAX, 100),
  maxBodySize: process.env.MAX_BODY_SIZE ?? '100kb',
  windSpeedMax: positiveNumber(process.env.WIND_SPEED_MAX, 10),
};
