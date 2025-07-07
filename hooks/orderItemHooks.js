// hooks/orderItemHooks.js
module.exports = (OrderItem) => {
  OrderItem.afterCreate(async (item, options) => {
    const { OrderItem, Order } = require('../models'); // ✅ Delayed import

    const order = await item.getOrder({
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order || !order.items) return;
    const total = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
    await order.update({ total_price: total });
  });

  OrderItem.afterDestroy(async (item, options) => {
    const { OrderItem, Order } = require('../models'); // ✅ Delayed import

    const order = await item.getOrder({
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order || !order.items) return;
    const total = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
    await order.update({ total_price: total });
  });
};
