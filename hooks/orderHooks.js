// hooks/orderHooks.js
const { Order, OrderItem, Product } = require('../models');

const afterDestroy = async (order, options) => {
  try {
    // Fetch associated order items
    const items = await OrderItem.findAll({
      where: { order_id: order.id }
    });

    // Restore stock for each item
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
        console.log(`✅ Restored ${item.quantity} units to product '${product.name}'`);
      }
    }

    // Update status to 'cancelled' if not already
    if (order.status !== 'delivered') {
      await Order.update(
        { status: 'cancelled' },
        { where: { id: order.id }, transaction: options.transaction }
      );
      console.log(`🔁 Order #${order.id} marked as 'cancelled' after deletion.`);
    }

  } catch (error) {
    console.error(`❌ Error in afterDestroy hook for order #${order.id}:`, error.message);
  }
};

module.exports = { afterDestroy };
