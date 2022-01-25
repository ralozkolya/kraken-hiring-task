import { Model, DataTypes } from 'sequelize';

import sequelize from '../base.mjs';

export class Transaction extends Model {};

Transaction.init({
  txid: {
    type: DataTypes.CHAR(64),
    primaryKey: true,
  },
  address: {
    type: DataTypes.STRING(35),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    defaultValue: 0,
  },
  confirmations: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'transactions',
  modelName: 'Transaction',
  timestamps: false,
  indexes: [
    { fields: [ 'address' ] },
    { fields: [ 'amount' ] },
    { fields: [ 'confirmations' ] },
  ]
});
