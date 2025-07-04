const { Order } = require('../../models');

module.exports = async (job) => {
  const { orderId, reason } = job.data;

  try {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    await order.update({ status: 'cancelled' });
    console.log(`Order ${orderId} cancelled. Reason: ${reason}`);
  } catch (err) {
    console.error('Order cancellation error:', err);
    throw err;
  }
};
