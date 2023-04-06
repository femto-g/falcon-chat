const { Pool } = require('pg');
//const pgSession = require('connect-pg-simple');
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, `../env/${process.env.NODE_ENV}.env`);
dotenv.config({path: envPath});

const nodeenv = process.env;

const poolOptions = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
}

const pool = new Pool(poolOptions);

const query = (text, params, callback) => {
  return pool.query(text, params, callback);
}


const createStore = (session) => {
  const store = require('connect-pg-simple')(session);
  return new store({
    pool: pool,
    createTableIfMissing: true
  });
}

const close = () => {
  pool.end();
}
module.exports = {query, createStore, close};