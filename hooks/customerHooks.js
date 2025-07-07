const bcrypt = require("bcrypt");

const registerCustomerHooks = (CustomerModel, models) => {
  const { Sequelize } = models;

  // Hash password before creating a customer
  CustomerModel.beforeCreate(async (customer) => {
    if (customer.password) {
      customer.password = await bcrypt.hash(customer.password, 10);
    }
  });

  // Hash password before updating a customer if changed
  CustomerModel.beforeUpdate(async (customer) => {
    if (customer.changed('password')) {
      customer.password = await bcrypt.hash(customer.password, 10);
    }
  });

  // Prevent deletion if the customer has undelivered orders
  CustomerModel.beforeDestroy(async (customer, options) => {
    const orders = await customer.getOrders({
      where: {
        status: {
          [Sequelize.Op.not]: 'delivered',
        },
      },
    });

    if (orders.length > 0) {
      throw new Error('Cannot delete customer with undelivered orders');
    }
  });
};

module.exports = registerCustomerHooks;
