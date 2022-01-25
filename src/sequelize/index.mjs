import Bluebird from 'bluebird';
import sequelize from './base.mjs';
import seed from './seed.mjs';

export const init = async () => {
  try {
    await sequelize.sync();
    return seed();
  } catch (e) {
    console.error(e.message);
    // MySQL container takes some time to initialize,
    // spamming it with connection trials won't help
    await Bluebird.delay(2000);
    process.exit();
  }
};

export * from './models/user.mjs';
export * from './models/transaction.mjs';
export default sequelize;
