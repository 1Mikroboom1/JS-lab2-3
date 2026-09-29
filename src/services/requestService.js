import crypto from 'node:crypto';
import { ConflictError, NotFoundError } from '../errors/index.js';
const transitions={new:['in_progress','rejected'],in_progress:['done','rejected'],done:[],rejected:[]};
const sortItems=(items,sort,order)=>items.sort((a,b)=>String(a[sort]??'').localeCompare(String(b[sort]??''))*((order==='desc')?-1:1));
export class RequestService {
  constructor(repo,equipmentRepo){this.repo=repo;this.equipmentRepo=equipmentRepo;}
  async list(q){let items=await this.repo.list();if(q.status)items=items.filter(x=>x.status===q.status);if(q.priority)items=items.filter(x=>x.priority===q.priority);if(q.equipmentId)items=items.filter(x=>x.equipmentId===q.equipmentId);if(q.from)items=items.filter(x=>x.createdAt>=q.from);if(q.to)items=items.filter(x=>x.createdAt<=q.to);sortItems(items,q.sort,q.order);const total=items.length;return {data:items.slice((q.page-1)*q.limit,q.page*q.limit),meta:{total,page:q.page,limit:q.limit}};}
  async get(id){const x=await this.repo.findById(id);if(!x)throw new NotFoundError('Заявка не найдена');return x;}
  async create(input){if(!(await this.equipmentRepo.findById(input.equipmentId)))throw new NotFoundError('Оборудование не найдено');const now=new Date().toISOString();return this.repo.create({id:crypto.randomUUID(),...input,status:'new',createdAt:now,updatedAt:now});}
  async patch(id,input){const old=await this.get(id);if(input.equipmentId&&!(await this.equipmentRepo.findById(input.equipmentId)))throw new NotFoundError('Оборудование не найдено');return this.repo.update(id,{...input,id:old.id,status:old.status,createdAt:old.createdAt,updatedAt:new Date().toISOString()});}
  async changeStatus(id,status){const old=await this.get(id);if(!transitions[old.status].includes(status))throw new ConflictError(`Переход ${old.status} → ${status} запрещён`);return this.repo.update(id,{status,updatedAt:new Date().toISOString()});}
  async remove(id){await this.get(id);await this.repo.remove(id);}
}
