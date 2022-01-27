import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import Bluebird from 'bluebird';
import { fileURLToPath } from 'url';
import { User, Transaction } from './index.mjs';

const filename = fileURLToPath(import.meta.url);

export default async () => {

  // Load and parse JSON files
  const [
    users,
    transactionSet1,
    transactionSet2,
  ] = await Bluebird.all([
    readFile(resolve(dirname(filename), '../data/users.json')),
    readFile(resolve(dirname(filename), '../data/transactions-1.json')),
    readFile(resolve(dirname(filename), '../data/transactions-2.json')),
  ]).map(JSON.parse);

  // Insert users into DB
  await Bluebird.each(users, user => {
    return User.findOrCreate({
      where: {
        address: user.address
      },
      defaults: {
        address: user.address,
        name: user.name
      }
    });
  });

  const transactions = transactionSet1.transactions.concat(transactionSet2.transactions);

  // Insert transactions into DB
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