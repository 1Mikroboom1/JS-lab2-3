import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { apiConfig } from './config/index.js';
import { JsonRepository } from './repositories/jsonRepository.js';
import { EquipmentService } from './services/equipmentService.js';
import { RequestService } from './services/requestService.js';
import { equipmentController } from './controllers/equipmentController.js';
import { requestController } from './controllers/requestController.js';
import { equipmentRoutes } from './routes/equipment.js';
import { requestRoutes } from './routes/requests.js';
import { requestId } from './middlewares/requestId.js';
import { logger } from './middlewares/logger.js';
import { notFoundHandler,errorHandler } from './middlewares/errorHandler.js';
export function createApp(){const app=express();const er=new JsonRepository('./data/equipment.json','equipment');const rr=new JsonRepository('./data/requests.json','requests');const es=new EquipmentService(er,rr);const rs=new RequestService(rr,er);const ec=equipmentController(es),rc=requestController(rs);app.use(requestId);app.use(logger);app.use(helmet());app.use(cors({origin:(origin,cb)=>{if(!origin||apiConfig.corsOrigins.includes(origin))return cb(null,true);return cb(null,false);},methods:['GET','POST','PATCH','DELETE','OPTIONS']}));app.use(express.json({limit:apiConfig.maxBodySize}));app.use('/api',rateLimit({windowMs:apiConfig.rateLimitWindowMs,limit:apiConfig.rateLimitMax,standardHeaders:'draft-7',legacyHeaders:false}));app.get('/api/health',(req,res)=>res.json({data:{status:'ok',requestId:req.requestId}}));app.use('/api/equipment',equipmentRoutes(ec));app.use('/api/requests',requestRoutes(rc));app.use(notFoundHandler);app.use(errorHandler);return app;}
