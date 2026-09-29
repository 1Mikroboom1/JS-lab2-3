import crypto from 'node:crypto';
import { ConflictError, NotFoundError } from '../errors/index.js';
const sortItems=(items,sort,order)=>items.sort((a,b)=>{const av=a[sort]??'',bv=b[sort]??'';return String(av).localeCompare(String(bv))*((order==='desc')?-1:1);});
export class EquipmentService {
  constructor(repo, requestRepo){this.repo=repo;this.requestRepo=requestRepo;}
  async list(q){let items=await this.repo.list();if(q.type)items=items.filter(x=>x.type===q.type);if(q.status)items=items.filter(x=>x.status===q.status);sortItems(items,q.sort,q.order);const total=items.length;return {data:items.slice((q.page-1)*q.limit,q.page*q.limit),meta:{total,page:q.page,limit:q.limit}};}
  async get(id){const x=await this.repo.findById(id);if(!x)throw new NotFoundError('Оборудование не найдено');return x;}
  async create(input){if((await this.repo.list()).some(x=>x.serialNumber===input.serialNumber))throw new ConflictError('Серийный номер уже используется');const now=new Date().toISOString();return this.repo.create({id:crypto.randomUUID(),...input,createdAt:now,updatedAt:now});}
  async patch(id,input){const old=await this.get(id);if(input.serialNumber&&(await this.repo.list()).some(x=>x.id!==id&&x.serialNumber===input.serialNumber))throw new ConflictError('Серийный номер уже используется');return this.repo.update(id,{...input,id:old.id,createdAt:old.createdAt,updatedAt:new Date().toISOString()});}
  async remove(id){await this.get(id);const open=(await this.requestRepo.list()).some(x=>x.equipmentId===id&&!['done','rejected'].includes(x.status));if(open)throw new ConflictError('Удаление запрещено: есть открытые заявки');await this.repo.remove(id);}
  async requests(id,q){await this.get(id);let items=(await this.requestRepo.list()).filter(x=>x.equipmentId===id);const total=items.length;sortItems(items,q.sort,q.order);return {data:items.slice((q.page-1)*q.limit,q.page*q.limit),meta:{total,page:q.page,limit:q.limit}};}
}
