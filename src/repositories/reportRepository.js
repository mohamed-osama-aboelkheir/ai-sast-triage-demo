const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({ connectionString: config.databaseUrl });

async function summary(tableName) {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS orders, coalesce(sum(total), 0) AS revenue FROM ${tableName}`
  );
  return rows[0];
}

module.exports = { summary };
