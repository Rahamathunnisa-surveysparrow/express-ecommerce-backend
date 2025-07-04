// bull/jobs/statusUpdateJob.js
const statusQueue = require('../queue/statusQueue');

const getNextStatus = (currentStatus) => {
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statuses.indexOf(currentStatus);
  return statuses[currentIndex + 1] || null;
};

const scheduleStatusUpdateJob = async (orderId, currentStatus = 'pending') => {
  const nextStatus = getNextStatus(currentStatus);
  if (!nextStatus) return;

  await statusQueue.add(
    'statusUpdate',
    {
      orderId,
      targetStatus: nextStatus,
    },
    {
      delay: 3600000,
      attempts: 3,
      backoff: 10000,
      removeOnComplete: true,
    }
  );
};

module.exports = { scheduleStatusUpdateJob };
