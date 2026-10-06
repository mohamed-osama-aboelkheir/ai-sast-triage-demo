const path = require('path');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  exportDir: path.join(__dirname, '..', '..', 'exports'),
};
