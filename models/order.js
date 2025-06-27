module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    customer_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    total_amount: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false 
    },
    created_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
  }, {
    tableName: "orders",
    timestamps: false,
  });

  return Order;
};

