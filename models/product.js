module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    description: { 
      type: DataTypes.TEXT 
    },
    price: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false 
    },
    quantity: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },
    created_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
  }, {
    tableName: "products",
    timestamps: false,
  });

  return Product;
};
