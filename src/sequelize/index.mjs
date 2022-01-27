import sequelize from './base.mjs';
import seed from './seed.mjs';

export const init = async () => {
  try {
    await sequelize.sync();
    return seed();
  } catch (e) {
    console.error(e.message);
  }
};

export * from './models/user.mjs';
export * from './models/transaction.mjs';
export default sequelize;
