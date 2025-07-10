// elasticsearch/client.js
require('dotenv').config(); // Load env vars

const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = client;
