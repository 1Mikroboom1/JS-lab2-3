import { Router } from 'express';
import { validate } from '../middlewares/validation.js';
import { requestCreate, requestPatch, requestListQuery, statusBody, idParam } from '../validators/request.js';

export function requestRoutes(c) {
  const r = Router();
  r.get('/', validate(requestListQuery, 'query'), c.list);
  r.post('/', validate(requestCreate, 'body'), c.create);
  r.get('/:id', validate(idParam, 'params'), c.get);
  r.patch('/:id', validate(idParam, 'params'), validate(requestPatch, 'body'), c.patch);
  r.patch('/:id/status', validate(idParam, 'params'), validate(statusBody, 'body'), c.status);
  r.delete('/:id', validate(idParam, 'params'), c.remove);
  return r;
}
