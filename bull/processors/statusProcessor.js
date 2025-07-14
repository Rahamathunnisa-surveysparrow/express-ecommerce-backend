module.exports = async (job) => {
  const { orderId, targetStatus } = job.data;

  console.log("\n" + "🟡".repeat(80));
  console.log(`🚚 [START] statusProcessor for Order #${orderId} → Target Status: ${targetStatus}`);
  console.log("🟡".repeat(80));

  try {
    const { Order, Customer } = require('../../models');
    const { scheduleStatusUpdateJob } = require('../jobs/statusUpdateJob');

    const order = await Order.findByPk(orderId, {
      include: {
        model: Customer,
        as: 'customer',
        paranoid: false
      }
    });

    if (!order) {
      console.warn(`❌ Order #${orderId} not found. Skipping...`);
      return;
    }

    if (order.deletedAt || order.status === 'cancelled') {
      console.warn(`⛔ Order #${orderId} is either deleted or cancelled. Skipping...`);
      return;
    }

    if (order.status === 'delivered') {
      console.log(`✅ Order #${orderId} has already been delivered. No further updates.`);
      return;
    }

    if (order.status === targetStatus) {
      console.log(`🔁 Order #${orderId} is already in status "${targetStatus}". Skipping update.`);
      return;
    }

    await order.update({ status: targetStatus });
    console.log(`✅✅✅ Status updated for Order #${orderId}: ${targetStatus.toUpperCase()}`);

    // Schedule next update
    if (targetStatus !== 'delivered') {
      await scheduleStatusUpdateJob(orderId, targetStatus);
    }

  } catch (err) {
    console.error(`❌ Error in statusProcessor for Order #${orderId}:`, err);
    throw err;
  } finally {
    console.log("🟢".repeat(80));
    console.log(`✅ [END] statusProcessor finished for Order #${orderId}`);
    console.log("🟢".repeat(80) + "\n");
  }
};
