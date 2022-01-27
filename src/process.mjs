import sequelize, { Op } from 'sequelize';
import { User, Transaction } from './sequelize/index.mjs';

const format = number => {
  /**
  * Although toFixed rounds the value to the nearest corresponding decimal,
  * in this case it's exactly what we need to remove floating point arithemtic
  * rounding error. That's the specifics of SQLite without decimal_sum
  * extension, and other DBMSes shouldn't have this issue. For this task I went
  * ahead with SQLite as it allows for no-configuration in-memory operation.
  * In real production environment, I'd choose more feature-rich DBMS, like
  * Postgres or MySQL.
  */
  return Number(number).toFixed(8);
};

export const process = async () => {

  const users = await User.findAll();
  const userMap = users.reduce((map, user) => {
    map[user.address] = user;
    return map;
  }, {});

  const deposits = await Transaction.findAll({
    attributes: [
      'address',
      [ sequelize.fn('sum', sequelize.col('amount')), 'sum' ],
      [ sequelize.fn('count', sequelize.col('txid')), 'count' ],
    ],
    where: {
      address: Object.keys(userMap),
      confirmations: {
        [ Op.gt ]: 5,
      },
      amount: {
        [ Op.gt ]: 0,
      },
    },
    group: [ 'address' ],
  });

  const noReference = await Transaction.findAll({
    attributes: [
      [ sequelize.fn('sum', sequelize.col('amount')), 'sum' ],
      [ sequelize.fn('count', sequelize.col('txid')), 'count' ],
    ],
    where: {
      address: {
        [ Op.not ]: Object.keys(userMap),
      },
      confirmations: {
        [ Op.gt ]: 5,
      },
      amount: {
        [ Op.gt ]: 0,
      }
    },
  });

  const minMax = await Transaction.findAll({
    attributes: [
      [ sequelize.fn('min', sequelize.col('amount')), 'min' ],
      [ sequelize.fn('max', sequelize.col('amount')), 'max' ],
    ],
    where: {
      /**
       * I'm assuming here that valid deposits refer to all the deposits,
       * not just from the known users. Another assumption here is that
       * zero-amount transactions are not valid
       */
      confirmations: {
        [ Op.gt ]: 5,
      },
      amount: {
        [ Op.gt ]: 0,
      }
    },
  });

  /**
   * Pretty sure the order shouldn't matter, but just to
   * be on the safe side,lets match with README.md order
   */
  const order = [
    'mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ',
    'mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp',
    'mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n',
    '2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo',
    'mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8',
    'miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM',
    'mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV',
  ]

  deposits
    .sort((a, b) => order.indexOf(a.address) - order.indexOf(b.address))
    .forEach(deposit => {
    const plain = deposit.get({ plain: true });
    console.log(`Deposited for ${userMap[plain.address].name}: count=${plain.count} sum=${format(plain.sum)}`)
  });

  const plainNoReference = noReference[0].get({ plain: true });
  const plainMinMax = minMax[0].get({ plain: true });

  console.log(`Deposited without reference: count=${plainNoReference.count} sum=${format(plainNoReference.sum)}`);
  console.log(`Smallest valid deposit: ${format(plainMinMax.min)}`);
  console.log(`Largest valid deposit: ${format(plainMinMax.max)}`);
};
