module.exports = async (job) => {
  const { orderId, targetStatus } = job.data;

  console.log(`🚚 Running statusProcessor for order #${orderId}, target status: ${targetStatus}`);

  try {
    const { Order, Customer } = require('../../models');
    const { scheduleStatusUpdateJob } = require('../jobs/statusUpdateJob');

    const order = await Order.findByPk(orderId, {
      include: {
        model: Customer,
        as: 'customer',
        paranoid: false,
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
      console.log(`✅ Order #${orderId} has been successfully delivered!!!`);
      console.log("================================================================================================="); // For readability in bull worker tab in terminal
      return;
    }

    await order.update({ status: targetStatus });
    console.log(`✅ Order #${orderId} status updated to ${targetStatus}`);
    console.log("================================================================================================="); // for readability in main server tab in terminal

    if (targetStatus !== 'delivered') {
      await scheduleStatusUpdateJob(orderId, targetStatus);
    }

    // Email sending is commented for now (you can re-enable it when needed)

  } catch (err) {
    console.error(`❌ Error in statusProcessor for order #${orderId}:`, err);
    throw err;
  }
};
