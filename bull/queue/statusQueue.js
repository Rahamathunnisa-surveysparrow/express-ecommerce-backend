const Queue = require('bull');
const Redis = require('ioredis');
const statusUpdateProcessor = require('../processors/statusProcessor');

const redisConnection = new Redis();

const statusQueue = new Queue('orderStatusQueue', {
  redis: redisConnection,
});


statusQueue.process('statusUpdate', statusUpdateProcessor);

console.log('✅ Registered processor for statusUpdate job');

module.exports = statusQueue;
