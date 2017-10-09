import { ISequelizeConfig } from 'sequelize-typescript'

export interface Config {
  [key: string]: ISequelizeConfig
}

export default {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    name: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST,
    port: 3306,
    database: 'mysql',
    dialect: 'mysql',
    timezone: '+09:00',
    charset: 'utf8mb4',
    modelPaths: [__dirname + '/../models'],
  },
  test: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    name: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST,
    port: 3306,
    database: 'mysql',
    dialect: 'mysql',
    timezone: '+09:00',
    charset: 'utf8mb4',
    modelPaths: [__dirname + '/../models'],
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    name: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST,
    port: 3306,
    database: 'mysql',
    dialect: 'mysql',
    timezone: '+09:00',
    charset: 'utf8mb4',
    modelPaths: [__dirname + '/../models'],
  }
} as Config
