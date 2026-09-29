import { asyncHandler } from '../middlewares/asyncHandler.js';
import { ExternalServiceError } from '../errors/index.js';
import { getEquipmentWeather } from '../services/equipmentWeatherService.js';

export function equipmentController(service) {
  return {
    list: asyncHandler(async (req, res) => res.json(await service.list(req.query))),
    get: asyncHandler(async (req, res) => res.json({ data: await service.get(req.params.id) })),
    create: asyncHandler(async (req, res) => {
      const data = await service.create(req.body);
      res.status(201).location(`/api/equipment/${data.id}`).json({ data });
    }),
    patch: asyncHandler(async (req, res) => res.json({ data: await service.patch(req.params.id, req.body) })),
    remove: asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      res.status(204).send();
    }),
    requests: asyncHandler(async (req, res) => res.json(await service.requests(req.params.id, req.query))),
    weather: asyncHandler(async (req, res) => {
      const equipment = await service.get(req.params.id);
      try {
        res.json({ data: await getEquipmentWeather(equipment) });
      } catch (_error) {
        throw new ExternalServiceError('Внешний погодный API временно недоступен');
      }
    }),
  };
}
