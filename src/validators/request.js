const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['new', 'in_progress', 'done', 'rejected'];
const REQUEST_SORT_FIELDS = ['id', 'title', 'priority', 'status', 'equipmentId', 'plannedAt', 'createdAt', 'updatedAt'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isDate = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

export function requestCreate(input) {
  const d = []; const v = {};
  if (!UUID_RE.test(input.equipmentId ?? '')) d.push({ field: 'equipmentId', message: 'equipmentId должен быть UUID существующего оборудования' }); else v.equipmentId = input.equipmentId;
  if (typeof input.title !== 'string' || input.title.length < 5 || input.title.length > 120) d.push({ field: 'title', message: 'От 5 до 120 символов' }); else v.title = input.title;
  if (input.description !== undefined) { if (typeof input.description !== 'string' || input.description.length > 2000) d.push({ field: 'description', message: 'До 2000 символов' }); else v.description = input.description; }
  if (!PRIORITIES.includes(input.priority)) d.push({ field: 'priority', message: 'Недопустимое значение' }); else v.priority = input.priority;
  if (input.plannedAt !== undefined) { if (!isDate(input.plannedAt)) d.push({ field: 'plannedAt', message: 'Некорректная ISO-дата' }); else v.plannedAt = input.plannedAt; }
  return { valid: !d.length, value: v, details: d };
}

export function requestPatch(input) {
  const d = []; const v = {};
  if (input.equipmentId !== undefined) { if (!UUID_RE.test(input.equipmentId)) d.push({ field: 'equipmentId', message: 'equipmentId должен быть UUID' }); else v.equipmentId = input.equipmentId; }
  if (input.title !== undefined) { if (typeof input.title !== 'string' || input.title.length < 5 || input.title.length > 120) d.push({ field: 'title', message: 'От 5 до 120 символов' }); else v.title = input.title; }
  if (input.description !== undefined) { if (typeof input.description !== 'string' || input.description.length > 2000) d.push({ field: 'description', message: 'До 2000 символов' }); else v.description = input.description; }
  if (input.priority !== undefined) { if (!PRIORITIES.includes(input.priority)) d.push({ field: 'priority', message: 'Недопустимое значение' }); else v.priority = input.priority; }
  if (input.plannedAt !== undefined) { if (!isDate(input.plannedAt)) d.push({ field: 'plannedAt', message: 'Некорректная ISO-дата' }); else v.plannedAt = input.plannedAt; }
  return { valid: !d.length, value: v, details: d };
}

export function requestListQuery(input) {
  const page = Number(input.page ?? 1), limit = Number(input.limit ?? 10);
  if (!Number.isInteger(page) || page < 1) return { valid: false, details: [{ field: 'page', message: 'page >= 1' }] };
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return { valid: false, details: [{ field: 'limit', message: 'limit от 1 до 100' }] };
  if (input.order && !['asc', 'desc'].includes(input.order)) return { valid: false, details: [{ field: 'order', message: 'asc или desc' }] };
  if (input.status && !STATUSES.includes(input.status)) return { valid: false, details: [{ field: 'status', message: 'Недопустимый статус' }] };
  if (input.priority && !PRIORITIES.includes(input.priority)) return { valid: false, details: [{ field: 'priority', message: 'Недопустимый приоритет' }] };
  if (input.equipmentId && !UUID_RE.test(input.equipmentId)) return { valid: false, details: [{ field: 'equipmentId', message: 'equipmentId должен быть UUID' }] };
  if (input.from && !isDate(input.from)) return { valid: false, details: [{ field: 'from', message: 'Некорректная дата from' }] };
  if (input.to && !isDate(input.to)) return { valid: false, details: [{ field: 'to', message: 'Некорректная дата to' }] };
  const sort = input.sort ?? 'createdAt';
  if (!REQUEST_SORT_FIELDS.includes(sort)) return { valid: false, details: [{ field: 'sort', message: `Недопустимое поле сортировки. Разрешены: ${REQUEST_SORT_FIELDS.join(', ')}` }] };
  return { valid: true, value: { ...input, page, limit, order: input.order ?? 'desc', sort }, details: [] };
}

export function statusBody(input) {
  return STATUSES.includes(input.status)
    ? { valid: true, value: { status: input.status }, details: [] }
    : { valid: false, details: [{ field: 'status', message: 'Недопустимый статус' }] };
}

export function idParam(input) {
  return UUID_RE.test(input.id ?? '')
    ? { valid: true, value: { id: input.id }, details: [] }
    : { valid: false, details: [{ field: 'id', message: 'id должен быть UUID' }] };
}
