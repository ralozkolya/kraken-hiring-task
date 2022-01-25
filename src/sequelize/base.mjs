import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

const {
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_HOST,
} = process.env;

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: MYSQL_HOST,
  database: MYSQL_DATABASE,
  username: MYSQL_USER,
  password: MYSQL_PASSWORD,
  logging: false,
});

export default sequelize;
