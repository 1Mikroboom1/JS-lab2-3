import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { equipmentCreate, equipmentPatch, listQuery, idParam } from '../validators/equipment.js';

export function equipmentRoutes(c) {
  const r = Router();
  r.get('/', validate(listQuery, 'query'), c.list);
  r.post('/', validate(equipmentCreate, 'body'), c.create);
  r.get('/:id/requests', validate(idParam, 'params'), validate(listQuery, 'query'), c.requests);
  r.get('/:id/weather', validate(idParam, 'params'), c.weather);
  r.get('/:id', validate(idParam, 'params'), c.get);
  r.patch('/:id', validate(idParam, 'params'), validate(equipmentPatch, 'body'), c.patch);
  r.delete('/:id', validate(idParam, 'params'), c.remove);
  return r;
}
