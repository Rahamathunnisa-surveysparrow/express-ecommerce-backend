require('dotenv').config();

module.exports = {
  development: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: "postgres",
    logging: true  // optional: disable SQL logs in terminal by setting this value to "false"
  }
};
