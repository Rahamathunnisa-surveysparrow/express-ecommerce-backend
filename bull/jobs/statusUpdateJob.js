const nextStatusMap = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

async function scheduleStatusUpdateJob(orderId, currentStatus) {
  const nextStatus = nextStatusMap[currentStatus];

  if (!nextStatus) {
    console.log(`🛑 No next status after "${currentStatus}" for Order #${orderId}. Skipping scheduling.`);
    return;
  }

  console.log(`📅 Scheduling next status update for Order #${orderId} → ${nextStatus}`);

  // Avoid circular dependency
  const statusQueue = require('../queue/statusQueue');

  await statusQueue.add('statusUpdate', {
    orderId,
    targetStatus: nextStatus
  }, {
    delay: 2 * 60 * 1000, // 2-minute delay
    attempts: 3,
    jobId: `${orderId}-${nextStatus}` // prevent duplicates
  });
}

module.exports = { scheduleStatusUpdateJob };
