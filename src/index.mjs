import sequelize, { init } from './sequelize/index.mjs';
import { process } from './process.mjs';

// Initialize and seed DB
await init();

// Analyze transactions and deposit users
await process();

sequelize.close();
