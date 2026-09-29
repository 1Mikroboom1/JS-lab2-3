export function logger(req, res, next) {
  const started = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - started;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.info(JSON.stringify({ level, requestId: req.requestId, method: req.method, path: req.originalUrl, status: res.statusCode, durationMs: duration }));
  });
  next();
}
