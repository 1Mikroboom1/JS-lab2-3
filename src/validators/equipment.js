const TYPES = ['turbine','inverter','sensor','substation'];
const EQUIPMENT_SORT_FIELDS = ['id','name','type','serialNumber','status','installedAt','createdAt','updatedAt'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = ['operational','maintenance','fault','decommissioned'];
const isoPast = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v)) && new Date(v) <= new Date();
const validLocation = (v) => v && typeof v === 'object' && typeof v.lat === 'number' && typeof v.lon === 'number' && v.lat >= -90 && v.lat <= 90 && v.lon >= -180 && v.lon <= 180;
export function equipmentCreate(input) {
  const d=[]; const v={};
  if (typeof input.name !== 'string' || input.name.length < 3 || input.name.length > 100) d.push({field:'name',message:'От 3 до 100 символов'}); else v.name=input.name;
  if (!TYPES.includes(input.type)) d.push({field:'type',message:'Недопустимый тип'}); else v.type=input.type;
  if (typeof input.serialNumber !== 'string' || !input.serialNumber.trim()) d.push({field:'serialNumber',message:'Обязательная строка'}); else v.serialNumber=input.serialNumber;
  if (!validLocation(input.location)) d.push({field:'location',message:'Некорректные координаты'}); else v.location={lat:input.location.lat,lon:input.location.lon};
  if (!STATUSES.includes(input.status ?? 'operational')) d.push({field:'status',message:'Недопустимый статус'}); else v.status=input.status ?? 'operational';
  if (!isoPast(input.installedAt)) d.push({field:'installedAt',message:'ISO-дата обязательна и не может быть в будущем'}); else v.installedAt=input.installedAt;
  return {valid:!d.length,value:v,details:d};
}
export function equipmentPatch(input) {
  const d=[]; const v={};
  if (input.name !== undefined) { if (typeof input.name !== 'string' || input.name.length < 3 || input.name.length > 100) d.push({field:'name',message:'От 3 до 100 символов'}); else v.name=input.name; }
  if (input.type !== undefined) { if (!TYPES.includes(input.type)) d.push({field:'type',message:'Недопустимый тип'}); else v.type=input.type; }
  if (input.serialNumber !== undefined) { if (typeof input.serialNumber !== 'string' || !input.serialNumber.trim()) d.push({field:'serialNumber',message:'Некорректный серийный номер'}); else v.serialNumber=input.serialNumber; }
  if (input.location !== undefined) { if (!validLocation(input.location)) d.push({field:'location',message:'Некорректные координаты'}); else v.location=input.location; }
  if (input.status !== undefined) { if (!STATUSES.includes(input.status)) d.push({field:'status',message:'Недопустимый статус'}); else v.status=input.status; }
  if (input.installedAt !== undefined) { if (!isoPast(input.installedAt)) d.push({field:'installedAt',message:'Некорректная дата'}); else v.installedAt=input.installedAt; }
  return {valid:!d.length,value:v,details:d};
}
export function listQuery(input) {
  const page=Number(input.page??1), limit=Number(input.limit??10);
  if (!Number.isInteger(page)||page<1) return {valid:false,details:[{field:'page',message:'page >= 1'}]};
  if (!Number.isInteger(limit)||limit<1||limit>100) return {valid:false,details:[{field:'limit',message:'limit от 1 до 100'}]};
  if (input.order && !['asc','desc'].includes(input.order)) return {valid:false,details:[{field:'order',message:'asc или desc'}]};
  const sort = input.sort ?? 'name';
  if (!EQUIPMENT_SORT_FIELDS.includes(sort)) return {valid:false,details:[{field:'sort',message:`Недопустимое поле сортировки. Разрешены: ${EQUIPMENT_SORT_FIELDS.join(', ')}`} ]};
  if (input.type !== undefined && !TYPES.includes(input.type)) return {valid:false,details:[{field:'type',message:'Недопустимый тип'}]};
  if (input.status !== undefined && !STATUSES.includes(input.status)) return {valid:false,details:[{field:'status',message:'Недопустимый статус'}]};
  return {valid:true,value:{...input,page,limit,order:input.order??'asc',sort},details:[]};
}

export function idParam(input) {
  return UUID_RE.test(input.id ?? '')
    ? { valid: true, value: { id: input.id }, details: [] }
    : { valid: false, details: [{ field: 'id', message: 'id должен быть UUID' }] };
}
