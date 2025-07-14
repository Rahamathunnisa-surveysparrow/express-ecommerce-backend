// bull/queue/cancelQueue.js
const Queue = require('bull');
const Redis = require('ioredis');
const connection = new Redis();

const cancelOrderQueue = new Queue('cancelOrderQueue', {
  redis: connection
});

module.exports = cancelOrderQueue;
