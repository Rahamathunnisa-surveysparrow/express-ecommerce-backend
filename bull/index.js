// bull/index.js
const Queue = require('bull');
const Redis = require('ioredis');
const statusUpdateProcessor = require('./processors/statusProcessor');
const cancelProcessor = require('./processors/cancelProcessor');

const connection = new Redis();

const statusUpdateQueue = new Queue('orderStatusQueue', { redis: connection });
const cancelOrderQueue = new Queue('cancelOrderQueue', { redis: connection });

// Register processors
statusUpdateQueue.process('statusUpdate', statusUpdateProcessor);
cancelOrderQueue.process(cancelProcessor);

// Logging
statusUpdateQueue.on('active', job => {
  console.log(`✅ ✅ ✅ Processing status update job #${job.id} for order #${job.data.orderId}`);
});
statusUpdateQueue.on('completed', job => {
  console.log(`✅ Job #${job.id} completed for order #${job.data.orderId}`);
});
statusUpdateQueue.on('failed', (job, err) => {
  console.error(`❌ Job #${job.id} failed:`, err.message);
});

cancelOrderQueue.on('active', job => {
  console.log(`❗ Processing cancel order job #${job.id}`);
});

console.log("🚀 Bull worker started and queues are now listening...");

module.exports = {
  statusUpdateQueue,
  cancelOrderQueue
};
