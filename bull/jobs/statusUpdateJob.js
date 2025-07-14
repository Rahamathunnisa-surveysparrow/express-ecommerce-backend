const nextStatusMap = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

async function scheduleStatusUpdateJob(orderId, currentStatus) {
  const nextStatus = nextStatusMap[currentStatus];

  if (!nextStatus) {
    console.log(`🛑 No next status after "${currentStatus}". Skipping scheduling.`);
    return;
  }

  console.log(`📅 Scheduling status update for order #${orderId} → ${nextStatus}`);

  // FIX: move require inside function to avoid circular dependency
  const statusQueue = require('../queue/statusQueue');

  await statusQueue.add('statusUpdate', {
    orderId,
    targetStatus: nextStatus
  }, {
    delay: 2 * 60 * 1000, // 2-minute delay (customizable)
    attempts: 3,
  });
}

module.exports = { scheduleStatusUpdateJob };
