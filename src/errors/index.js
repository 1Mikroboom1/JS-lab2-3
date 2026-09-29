export class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Некорректные данные запроса', details = []) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Конфликт данных') {
    super(message, 409, 'CONFLICT');
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'Внешний сервис временно недоступен', details = []) {
    super(message, 503, 'WEATHER_API_UNAVAILABLE', details);
  }
}
