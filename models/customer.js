const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    'Customer',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'customers',
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  );

  // Associations
  Customer.associate = models => {
    Customer.hasMany(models.Order, {
      foreignKey: 'customer_id',
      as: 'orders'
    });
  };

  // Automatically hash password before saving
  Customer.beforeCreate(async (customer) => {
    if (customer.password) {
      customer.password = await bcrypt.hash(customer.password, 10);
    }
  });

  Customer.beforeUpdate(async (customer) => {
    if (customer.changed('password')) {
      customer.password = await bcrypt.hash(customer.password, 10);
    }
  });

  // Prevent deletion if undelivered orders exist
  Customer.beforeDestroy(async (customer, options) => {
    const orders = await customer.getOrders({
      where: {
        status: {
          [Sequelize.Op.not]: 'delivered'
        }
      }
    });

    if (orders.length > 0) {
      throw new Error('Cannot delete customer with undelivered orders');
    }
  });

  // Automatically remove password from API responses
  Customer.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return Customer;
};
