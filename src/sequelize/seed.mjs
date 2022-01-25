import { readFile } from 'fs/promises';
import Bluebird from 'bluebird';
import { User, Transaction } from './index.mjs';

export default async () => {

  // Load and parse JSON files
  const [
    users,
    transactionSet1,
    transactionSet2
  ] = await Bluebird.all([
    readFile('./data/users.json'),
    readFile('./data/transactions-1.json'),
    readFile('./data/transactions-2.json')
  ]).map(JSON.parse);

  await Bluebird.each(users, user => {
    return User.findOrCreate({
      where: {
        address: user.address
      },
      defaults: user
    });
  });

  const transactions = transactionSet1.transactions.concat(transactionSet2.transactions);

  await Bluebird.each(transactions, transaction => {
    return Transaction.findOrCreate({
      where: {
        // txid is unique and duplicate instances can be ignored
        txid: transaction.txid,
      },
      defaults: {
        txid: transaction.txid,
        address: transaction.address,
        amount: transaction.amount,
        confirmations: transaction.confirmations,
      }
    })
  });
};