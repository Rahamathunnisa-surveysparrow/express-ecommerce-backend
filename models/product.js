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
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: "products",
    timestamps: true,
    paranoid: true,
    underscored: true
  });

  Product.associate = models => {
    Product.hasMany(models.OrderItem, {
      foreignKey: 'product_id',
      as: 'orderItems'
    });
  };

  return Product;
};
