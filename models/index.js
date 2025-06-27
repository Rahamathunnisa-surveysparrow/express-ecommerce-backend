const Sequelize = require("sequelize");
const config = require("../config").development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

// Import models
const Customer = require("./customer")(sequelize, Sequelize.DataTypes);
const Product = require("./product")(sequelize, Sequelize.DataTypes);
const Order = require("./order")(sequelize, Sequelize.DataTypes);
const OrderItem = require("./order_item")(sequelize, Sequelize.DataTypes);

// Define associations
Customer.hasMany(Order, { foreignKey: "customer_id" });
Order.belongsTo(Customer, { foreignKey: "customer_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

// Export models
const db = {
  sequelize,
  Sequelize,
  Customer,
  Product,
  Order,
  OrderItem,
};

module.exports = db;
