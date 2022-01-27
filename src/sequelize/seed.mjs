import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import Bluebird from 'bluebird';
import { fileURLToPath } from 'url';
import { User, Transaction } from './index.mjs';

const dirName = dirname(fileURLToPath(import.meta.url));

export default async () => {

  // Load and parse JSON files
  const [
    users,
    transactionSet1,
    transactionSet2,
  ] = await Bluebird.all([
    readFile(resolve(dirName, '../data/users.json')),
    readFile(resolve(dirName, '../data/transactions-1.json')),
    readFile(resolve(dirName, '../data/transactions-2.json')),
  ]).map(JSON.parse);

  // Insert users into DB
  await Bluebird.each(users, user => User.upsert({
    address: user.address,
    name: user.name
  }, { fields: [] })); // Empty fields creates DO NOTHING query

  const transactions = transactionSet1.transactions.concat(transactionSet2.transactions);

  // Insert transactions into DB
  await Bluebird.each(transactions, transaction => Transaction.upsert({
    txid: transaction.txid,
    address: transaction.address,
    amount: transaction.amount,
    confirmations: transaction.confirmations,
  }, { fields: [] })); // Empty fields creates DO NOTHING query
};