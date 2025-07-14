module.exports = async (job) => {
  const { orderId } = job.data;

  console.log("\n" + "🟤".repeat(80));
  console.log(`🗑️  [START] cancelProcessor for Order #${orderId}`);
  console.log("🟤".repeat(80));

  try {
    const { Order, Product, OrderItem } = require('../../models');

    const order = await Order.findByPk(orderId, {
      include: {
        model: OrderItem,
        as: 'items',
        paranoid: false,
      }
    });

    if (!order) {
      console.warn(`❌ Order #${orderId} not found. Skipping cancel.`);
      return;
    }

    if (order.deletedAt) {
      console.warn(`⚠️ Order #${orderId} already deleted. Skipping cancel.`);
      return;
    }

    if (order.status === 'delivered') {
      console.log(`🚫 Cannot cancel Order #${orderId} – already delivered.`);
      return;
    }

    // Update status first
    await order.update({ status: 'cancelled' });

    // Soft delete the order
    await order.destroy();

    // Restore stock
    for (const item of order.items) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.product_id }
      });
    }

    console.log(`✅ Order #${orderId} cancelled & stock restored.`);

  } catch (err) {
    console.error(`❌ Error in cancelProcessor for Order #${orderId}:`, err);
    throw err;
  } finally {
    console.log("🟢".repeat(80));
    console.log(`✅ [END] cancelProcessor finished for Order #${orderId}`);
    console.log("🟢".repeat(80) + "\n");
  }
};
