require('dotenv').config({ path: '.env.local' });
const { neon, neonConfig } = require('@neondatabase/serverless');

// Set the WebSocket implementation for the driver
// This is required for the serverless driver to work correctly.
neonConfig.webSocketConstructor = require('ws');

const sql = neon(process.env.DATABASE_URL);

module.exports = sql;