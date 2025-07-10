// hooks/orderItemHooks.js
const { invalidateOrderCache } = require('../utils/cacheHelpers');

module.exports = (OrderItem) => {
  // ─── AFTER CREATE ──────────────────────
  OrderItem.afterCreate(async (item, options) => {
    const { OrderItem, Order } = require('../models'); // Delayed import

    console.log(`🛒 OrderItem created: Order #${item.order_id}, Product #${item.product_id}`);

    const order = await item.getOrder({
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order || !order.items) return;

    const total = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
    await order.update({ total_price: total });

    await invalidateOrderCache(order.id);
    console.log(`📦 Order total recalculated (after create): ₹${total}`);
  });

  // ─── AFTER UPDATE ──────────────────────
  OrderItem.afterUpdate(async (item, options) => {
    const { OrderItem, Order } = require('../models');

    console.log(`✏️ OrderItem updated: Order #${item.order_id}, Product #${item.product_id}`);

    const order = await item.getOrder({
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order || !order.items) return;

    const total = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
    await order.update({ total_price: total });

    await invalidateOrderCache(order.id);
    console.log(`📦 Order total recalculated (after update): ₹${total}`);
  });

  // ─── AFTER DESTROY ─────────────────────
  OrderItem.afterDestroy(async (item, options) => {
    const { OrderItem, Order } = require('../models');

    console.log(`🗑️ OrderItem removed: Order #${item.order_id}, Product #${item.product_id}`);

    const order = await item.getOrder({
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order || !order.items) return;

    const total = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
    await order.update({ total_price: total });

    await invalidateOrderCache(order.id);
    console.log(`📦 Order total recalculated (after delete): ₹${total}`);
  });
};
