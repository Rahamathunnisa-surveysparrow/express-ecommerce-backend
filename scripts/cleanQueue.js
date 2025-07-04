// scripts/cleanQueue.js

const { getStatusQueue, getCancelQueue } = require('../bull/queue');
const chalk = {
  blue: (s) => s,
  red: (s) => s,
  green: (s) => s,
  yellow: (s) => s
};


const preserveOrderId = 41;

const cleanOtherJobs = async (queue, queueName) => {
  console.log(chalk.blue(`\n🔍 Cleaning ${queueName} queue...`));

  const jobs = await queue.getJobs(['delayed', 'waiting', 'active', 'completed', 'failed']);

  for (const job of jobs) {
    const { orderId } = job.data || {};
    if (orderId === preserveOrderId) {
      console.log(chalk.yellow(`⏭️  Skipping job for order #${orderId}`));
      continue;
    }

    console.log(chalk.red(`🗑️  Removing job #${job.id} for order #${orderId}`));
    await job.remove();
  }

  console.log(chalk.green(`✅ Finished cleaning ${queueName} queue.`));
};

(async () => {
  try {
    await cleanOtherJobs(getStatusQueue(), 'statusUpdateQueue');
    await cleanOtherJobs(getCancelQueue(), 'cancelOrderQueue');
    console.log(chalk.green('\n🚀 Queue cleanup complete!\n'));
    process.exit(0);
  } catch (err) {
    console.error(chalk.red('❌ Failed to clean queues:'), err);
    process.exit(1);
  }
})();
