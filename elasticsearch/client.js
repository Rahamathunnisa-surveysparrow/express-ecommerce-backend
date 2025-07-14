require('dotenv').config(); // Load env vars

const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTIC_NODE
});

module.exports = client;
