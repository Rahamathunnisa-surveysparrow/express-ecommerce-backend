module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    },
    {
      tableName: 'order_items',
      timestamps: true,
      paranoid: true
    }
  );

OrderItem.afterCreate(async (item, options) => {
  const order = await item.getOrder({
    include: [{ model: sequelize.models.OrderItem, as: 'items' }]
  });

  if (!order || !order.items) return; // Prevent crash if null

  const total = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
  await order.update({ total_price: total });
});

OrderItem.afterDestroy(async (item, options) => {
  const order = await item.getOrder({
    include: [{ model: sequelize.models.OrderItem, as: 'items' }]
  });

  if (!order || !order.items) return; // Prevent crash if null

  const total = order.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
  await order.update({ total_price: total });
});


  return OrderItem;
};
