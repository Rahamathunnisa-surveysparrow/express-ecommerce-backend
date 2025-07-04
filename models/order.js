module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      }
    },
    {
      tableName: 'orders',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );


    // ⬇️ Association goes here
  Order.associate = function (models) {
    Order.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
  };
  
Order.beforeDestroy(async (order, options) => {
  if (order.status === 'delivered') {
    throw new Error('Delivered orders cannot be cancelled or deleted');
  }
});


  Order.afterCreate(async (order, options) => {
    console.log(`Order #${order.id} created for customer #${order.customer_id}`);
  });

  return Order;
};



