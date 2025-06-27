// utils/redisClient.js
const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => console.error('❌ Redis Error:', err));

// Ensure connection is awaited (important!)
(async () => {
  await client.connect();
})();

module.exports = client;
