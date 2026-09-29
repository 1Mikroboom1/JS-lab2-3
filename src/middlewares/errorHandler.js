import { AppError } from '../errors/index.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(`Маршрут ${req.method} ${req.originalUrl} не найден`, 404, 'NOT_FOUND'));
}

export function errorHandler(error, req, res, _next) {
  const isJsonParseError = error?.type === 'entity.parse.failed';
  const isPayloadTooLarge = error?.type === 'entity.too.large';
  const appError = error instanceof AppError;

  let status = appError ? error.status : 500;
  let code = appError ? error.code : 'INTERNAL_ERROR';
  let message = appError ? error.message : 'Внутренняя ошибка сервера';
  let details = appError ? error.details : [];

  if (isJsonParseError) {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Некорректный JSON в теле запроса';
    details = [{ field: 'body', message: 'Проверьте синтаксис JSON' }];
  } else if (isPayloadTooLarge) {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Размер тела запроса превышает допустимый лимит';
    details = [];
  }

  if (status >= 500) {
    console.error(JSON.stringify({
      level: 'ERROR',
      requestId: req.requestId,
      message: error?.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error?.stack,
    }));
  }

  res.status(status).json({
    error: {
      code,
      message,
      details,
      requestId: req.requestId,
    },
  });
}
