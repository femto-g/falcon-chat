const { Pool } = require('pg');
const pgSession = require('connect-pg-simple');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
})

const query = (text, params, callback) => {
  return pool.query(text, params, callback);
}

const createStore = (session) => {
  const store = pgSession(session);
  return new store({
    pool: pool,
    createTableIfMissing: true
  });
}

module.exports = {query, createStore};