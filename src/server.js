import { createApp } from './app.js';
import { apiConfig } from './config/index.js';
createApp().listen(apiConfig.port,()=>console.info(`REST API запущен на http://localhost:${apiConfig.port}`));
