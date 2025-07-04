// bull/processors/statusProcessor.js
const { Order, Customer } = require('../../models');
const sendEmail = require('../../utils/sendEmail');

module.exports = async (job) => {
  const { orderId, targetStatus } = job.data;

  console.log(`🚚 Running statusProcessor for order #${orderId}, target status: ${targetStatus}`);

  try {
    const order = await Order.findByPk(orderId, {
      include: { model: Customer, as: 'customer' },
    });

    if (!order || order.deletedAt || order.status === 'cancelled') {
      console.warn(`⛔ Skipping order #${orderId} due to invalid state.`);
      return;
    }

    if (order.status === 'delivered') {
      console.log(`✅ Order #${orderId} already delivered`);
      return;
    }

    await order.update({ status: targetStatus });
    console.log(`✅ Order #${orderId} status updated to ${targetStatus}`);

    await sendEmail({
      to: order.customer.email,
      subject: `Your order #${order.id} is now ${targetStatus}`,
      html: `<p>Hi ${order.customer.name},</p><p>Your order is now <strong>${targetStatus}</strong>.</p>`
    });

    if (targetStatus !== 'delivered') {
      const { scheduleStatusUpdateJob } = require('../jobs/statusUpdateJob');
      await scheduleStatusUpdateJob(orderId, targetStatus);
    }

  } catch (err) {
    console.error('❌ Error in statusProcessor:', err);
    throw err;
  }
};
