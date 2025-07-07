// bull/processors/statusProcessor.js

const { Order, Customer } = require('../../models');
const sendEmail = require('../../utils/sendEmail');
const { scheduleStatusUpdateJob } = require('../jobs/statusUpdateJob');

module.exports = async (job) => {
  const { orderId, targetStatus } = job.data;

  console.log(`🚚 Running statusProcessor for order #${orderId}, target status: ${targetStatus}`);

  try {
    const order = await Order.findByPk(orderId, {
      include: {
        model: Customer,
        as: 'customer',
        paranoid: false // Fetch even soft-deleted customers
      }
    });

    if (!order) {
      console.warn(`❌ Order #${orderId} not found. Skipping...`);
      return;
    }

    if (order.deletedAt || order.status === 'cancelled') {
      console.warn(`⛔ Order #${orderId} is deleted or cancelled. Skipping...`);
      return;
    }

    if (order.status === 'delivered') {
      console.log(`✅ Order #${orderId} already delivered. No update needed.`);
      return;
    }

    // Update order status
    await order.update({ status: targetStatus });
    console.log(`✅ Order #${orderId} status updated to ${targetStatus}`);

    // Safe email sending
    if (order.customer) {
      await sendEmail({
        to: order.customer.email,
        subject: `Your order #${order.id} is now ${targetStatus}`,
        html: `<p>Hi ${order.customer.name},</p>
               <p>Your order status is now <strong>${targetStatus.toUpperCase()}</strong>.</p>
               <p>Thank you for shopping with us!</p>`
      });
    } else {
      console.warn(`⚠️ No customer found for order #${orderId}. Email not sent.`);
    }

    // Schedule next status update if not final
    if (targetStatus !== 'delivered') {
      await scheduleStatusUpdateJob(orderId, targetStatus);
    }

  } catch (err) {
    console.error(`❌ Error in statusProcessor for order #${orderId}:`, err);
    throw err;
  }
};
