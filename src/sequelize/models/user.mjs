import { Model, DataTypes } from 'sequelize';

import sequelize from '../base.mjs';

export class User extends Model {};

User.init({
  address: {
    type: DataTypes.STRING(35),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
  }
}, {
  sequelize,
  timestamps: false,
});
