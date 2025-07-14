async function scheduleCancelOrderJob(orderId, delayMs = 0) {
  console.log(`📅 Scheduling cancel job for Order #${orderId} with delay: ${delayMs / 1000}s`);

  // Avoid circular dependency
  const cancelQueue = require('../queue/cancelQueue');

  await cancelQueue.add('cancelOrder', { orderId }, {
    delay: delayMs,
    attempts: 3,
    jobId: `cancel-${orderId}`, // prevents duplicate cancel jobs
  });
}

module.exports = { scheduleCancelOrderJob };
