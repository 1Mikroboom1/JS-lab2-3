import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
export class JsonRepository {
  constructor(filePath, resource) { this.filePath = filePath; this.resource = resource; this.data = null; }
  async load() {
    if (this.data) return this.data;
    try { this.data = JSON.parse(await readFile(this.filePath, 'utf8')); }
    catch (e) { if (e.code === 'ENOENT') this.data = { [this.resource]: [] }; else throw e; }
    if (!Array.isArray(this.data[this.resource])) this.data[this.resource] = [];
    return this.data;
  }
  async save() { await mkdir(dirname(this.filePath), { recursive: true }); await writeFile(this.filePath, JSON.stringify(this.data, null, 2)); }
  async list() { const d = await this.load(); return [...d[this.resource]]; }
  async findById(id) { return (await this.list()).find((x) => x.id === id) ?? null; }
  async create(item) { const d = await this.load(); d[this.resource].push(item); await this.save(); return item; }
  async update(id, changes) { const d = await this.load(); const i = d[this.resource].findIndex((x) => x.id === id); if (i < 0) return null; d[this.resource][i] = { ...d[this.resource][i], ...changes }; await this.save(); return d[this.resource][i]; }
  async remove(id) { const d = await this.load(); const i = d[this.resource].findIndex((x) => x.id === id); if (i < 0) return false; d[this.resource].splice(i,1); await this.save(); return true; }
}
