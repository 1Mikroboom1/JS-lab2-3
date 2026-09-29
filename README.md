# Case №2

Репозиторий содержит обязательную часть Кейса 1 и Кейса 2. В Кейсе 2 реализован REST API на Express для учёта оборудования и заявок на техническое обслуживание. Хранилище - JSON-файлы; PostgreSQL переносится на Неделю 3.

## Требования

- Node.js 20+
- npm

## Установка и запуск

```bash
npm install
cp .env.example .env
npm start
```

API по умолчанию доступен на `http://localhost:3000`.

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `PORT` | порт HTTP-сервера |
| `NODE_ENV` | режим приложения |
| `CORS_ORIGINS` | список разрешённых CORS-источников через запятую |
| `RATE_LIMIT_WINDOW_MS` | окно rate limit в миллисекундах |
| `RATE_LIMIT_MAX` | максимальное число запросов за окно |
| `MAX_BODY_SIZE` | максимальный размер JSON-тела |
| `REQUEST_TIMEOUT_MS` | таймаут внешнего HTTP-запроса |
| `WEATHER_API_URL` | URL Open-Meteo Forecast API |
| `GEOCODING_BASE_URL` | URL Open-Meteo Geocoding API для Кейса 1 |
| `TEMPERATURE_UNIT` | единица температуры (`celsius` / `fahrenheit`) |
| `PRECIPITATION_UNIT` | единица осадков (`mm` / `inch`) |
| `WIND_SPEED_MAX` | максимальная скорость ветра для наружных работ, км/ч |

## API

### Оборудование

| Метод | URL | Назначение |
|---|---|---|
| GET | `/api/equipment` | список с фильтрами, сортировкой и пагинацией |
| POST | `/api/equipment` | создание |
| GET | `/api/equipment/:id` | карточка |
| PATCH | `/api/equipment/:id` | частичное обновление |
| DELETE | `/api/equipment/:id` | удаление |
| GET | `/api/equipment/:id/requests` | заявки оборудования |
| GET | `/api/equipment/:id/weather` | прогноз и пригодность наружных работ |

### Заявки

| Метод | URL | Назначение |
|---|---|---|
| GET | `/api/requests` | список с фильтрами, сортировкой и пагинацией |
| POST | `/api/requests` | создание |
| GET | `/api/requests/:id` | карточка |
| PATCH | `/api/requests/:id` | редактирование |
| PATCH | `/api/requests/:id/status` | смена статуса |
| DELETE | `/api/requests/:id` | удаление |

Дополнительно: `GET /api/health`.

Списочные ответы имеют вид:

```json
{
  "data": [],
  "meta": { "total": 1, "page": 1, "limit": 10 }
}
```

## Модель данных

### Equipment

- `id` - UUID, создаётся сервером;
- `name` - 3–100 символов;
- `type` - `turbine`, `inverter`, `sensor`, `substation`;
- `serialNumber` - уникальный;
- `location.lat/lon` - координаты;
- `status` - `operational`, `maintenance`, `fault`, `decommissioned`;
- `installedAt` - ISO-дата, не в будущем;
- `createdAt`, `updatedAt` - серверные даты.

### Maintenance request

- `id` - UUID, создаётся сервером;
- `equipmentId` - UUID существующего оборудования;
- `title` - 5–120 символов;
- `description` - до 2000 символов;
- `priority` - `low`, `medium`, `high`, `critical`;
- `status` - `new`, `in_progress`, `done`, `rejected`;
- `plannedAt` - необязательная ISO-дата;
- `createdAt`, `updatedAt` - серверные даты.

### Переходы статусов

```text
new → in_progress → done
  |→ rejected
        |→ rejected
```

Из `done` и `rejected` переходы запрещены и возвращают `409 Conflict`.

## Погода

`GET /api/equipment/:id/weather` берёт координаты оборудования и переиспользует клиент Open-Meteo из Кейса 1. Запрашиваются температура, осадки и максимальная скорость ветра. Окно считается пригодным для наружных работ, если для всех возвращённых дней:

1. сумма осадков равна `0`;
2. максимальная скорость ветра не превышает `WIND_SPEED_MAX`.

При недоступности внешнего API возвращается `503` с единым объектом ошибки; процесс сервера продолжает работать.

Пример успешного ответа:

```json
{
  "data": {
    "equipmentId": "...",
    "location": { "lat": 56.3269, "lon": 44.0059 },
    "forecast": [
      { "date": "2026-09-29", "minTemperature": 5, "maxTemperature": 12, "precipitation": 0, "windSpeed": 7.5 }
    ],
    "suitableForOutdoorWork": true,
    "rule": "Окно пригодно, если нет осадков и максимальная скорость ветра не превышает 10 км/ч.",
    "windSpeedMax": 10
  }
}
```

## Ошибки

Все ошибки возвращаются в едином формате:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректные данные запроса",
    "details": [
      { "field": "priority", "message": "Недопустимое значение" }
    ],
    "requestId": "..."
  }
}
```

Основные коды: `400` - некорректный JSON, `404` - ресурс/маршрут не найден, `409` - конфликт или запрещённый переход, `422` - ошибка валидации, `429` - превышение rate limit, `503` - недоступен погодный API. В production стек-трейс и внутренние детали не выдаются клиенту.

Пример ошибки валидации:

```http
POST /api/equipment
Content-Type: application/json
```

```json
{
  "name": "x",
  "type": "wrong"
}
```

Ответ - `422` с массивом `details`.

Пример конфликта:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Серийный номер уже используется",
    "details": [],
    "requestId": "..."
  }
}
```

## Безопасность и middleware

Порядок обработки запроса:

```text
requestId → logger → helmet → CORS → JSON parser → rate limit → routes → 404 → error handler
```

- CORS использует явный список `CORS_ORIGINS`, а не `*`; в типовом локальном запуске разрешается `http://localhost:3000`.
- Rate limit применяется ко всем маршрутам `/api` и возвращает `429` и стандартные заголовки лимита.
- JSON-тело ограничено `MAX_BODY_SIZE`.
- Helmet устанавливает защитные HTTP-заголовки.
- Cookie в текущем решении не используются, поэтому `HttpOnly`, `Secure`, `SameSite` не применяются.
- Каждый запрос получает `requestId`; он попадает в ошибочный ответ и журнал.
- В логах фиксируются уровень, request ID, метод, путь, HTTP-код и длительность.

Для детерминированной демонстрации сценария `429` в Postman можно перед запуском сервера установить `RATE_LIMIT_MAX=5`; коллекция содержит запрос, который создаёт превышение лимита.

## Postman

Коллекция находится в:

```text
docs/postman/case2-equipment-maintenance.postman_collection.json
```

Она содержит все endpoint'ы, переменные `{{baseUrl}}`, `{{equipmentId}}`, `{{requestId}}`, `{{serialNumber}}`, автотесты `pm.test` и негативные сценарии `400`, `404`, `409`, `422`, `429`.

## Структура проекта

```text
src/
├── api/
├── controllers/
├── services/
├── repositories/
├── routes/
├── middlewares/
├── validators/
├── errors/
├── config/
├── format/
├── storage/
├── app.js
├── server.js
└── index.js
```

Слоистая схема: `routes → controllers → services → repositories`. Работа с данными изолирована в `JsonRepository`, поэтому на Неделе 3 хранилище можно заменить на PostgreSQL/Sequelize без изменения контроллеров и маршрутов.

## Кейс 1

Консольная утилита запускается отдельно:

```bash
node src/index.js --city "Нижний Новгород" --days 3
```

Её клиент Open-Meteo переиспользуется API Кейса 2 через сервис погоды.
