import sequelize from './base.mjs';
import seed from './seed.mjs';

export const init = async () => {
  await sequelize.sync();
  return seed();
};

export * from './models/user.mjs';
export * from './models/transaction.mjs';
export default sequelize;
