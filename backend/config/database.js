//config/database.js
const oracledb = require('oracledb');
require('dotenv').config();

// Configure Oracle client for thick mode (if needed)
try {
  oracledb.initOracleClient();
} catch (err) {
  console.log('Oracle Instant Client already initialized or not required');
}

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};

async function initialize() {
  try {
    await oracledb.createPool({
      ...dbConfig,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 2
    });
    console.log('✅ Oracle connection pool created successfully');
  } catch (err) {
    console.error('❌ Error creating connection pool:', err);
    process.exit(1);
  }
}

async function close() {
  try {
    await oracledb.getPool().close(10);
    console.log('Pool closed');
  } catch (err) {
    console.error(err);
  }
}

module.exports = { initialize, close };