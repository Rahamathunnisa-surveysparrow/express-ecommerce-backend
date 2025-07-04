// bull/jobs/statusUpdateJob.js
const { statusUpdateQueue } = require('../index'); // ✅ Import shared queue

const getNextStatus = (currentStatus) => {
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statuses.indexOf(currentStatus);
  return statuses[currentIndex + 1] || null;
};

const scheduleStatusUpdateJob = async (orderId, currentStatus = 'pending') => {
  const nextStatus = getNextStatus(currentStatus);
  if (!nextStatus) return;

  await statusUpdateQueue.add(
    'statusUpdate',
    {
      orderId,
      targetStatus: nextStatus,
    },
    {
      delay: 60 * 60 * 1000,
      attempts: 3,
      backoff: { type: 'fixed', delay: 10000 },
      removeOnComplete: true,
    }
  );
};

module.exports = { scheduleStatusUpdateJob };
