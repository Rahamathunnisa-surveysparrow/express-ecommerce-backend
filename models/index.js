const Sequelize = require("sequelize");
const config = require("../config/config").development;

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

const db = {
  sequelize,
  Sequelize,
  Customer,
  Product,
  Order,
  OrderItem,
};

// Call `.associate()` from each model
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
