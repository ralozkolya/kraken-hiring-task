import sequelize from 'sequelize';
import { Op } from 'sequelize';
import s, { User, Transaction } from './sequelize/index.mjs';

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


  let smallest = Infinity;
  let largest = -Infinity;
  deposits.forEach(deposit => {

    const plain = deposit.get({ plain: true });

    if (plain.sum < smallest) {
      smallest = plain.sum;
    }

    if (plain.sum > largest) {
      largest = plain.sum;
    }

    console.log(`Deposited for ${userMap[plain.address].name}: count=${plain.count} sum=${plain.sum}`)
  });

  const plain = noReference[0].get({ plain: true });

  console.log(`Deposited without reference: count=${plain.count} sum=${plain.sum}`);
  console.log(`Smallest valid deposit: ${smallest}`);
  console.log(`Largest valid deposit: ${largest}`);
};

// Deposited for Wesley Crusher: count=n sum=x.xxxxxxxx
// Deposited for Leonard McCoy: count=n sum=x.xxxxxxxx
// Deposited for Jonathan Archer: count=n sum=x.xxxxxxxx
// Deposited for Jadzia Dax: count=n sum=x.xxxxxxxx
// Deposited for Montgomery Scott: count=n sum=x.xxxxxxxx
// Deposited for James T. Kirk: count=n sum=x.xxxxxxxx
// Deposited for Spock: count=n sum=x.xxxxxxxx
// Deposited without reference: count=n sum=x.xxxxxxxx
// Smallest valid deposit: x.xxxxxxxx
// Largest valid deposit: x.xxxxxxxx