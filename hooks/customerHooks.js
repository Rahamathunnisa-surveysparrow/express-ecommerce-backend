const bcrypt = require("bcrypt");

const registerCustomerHooks = (CustomerModel, models) => {
  const { Sequelize } = models;

  // ─── CREATE ──────────────────────────────
  CustomerModel.beforeCreate(async (customer) => {
    console.log(`📥 Creating new customer: ${customer.email}`);
    if (customer.password) {
      customer.password = await bcrypt.hash(customer.password, 10);
    }
  });

  CustomerModel.afterCreate(async (customer) => {
    console.log(`✅ Customer created successfully: ID ${customer.id}`);
  });

  // ─── UPDATE ──────────────────────────────
  CustomerModel.beforeUpdate(async (customer) => {
    console.log(`🔄 Updating customer: ID ${customer.id}`);
    if (customer.changed('password')) {
      customer.password = await bcrypt.hash(customer.password, 10);
    }
  });

  CustomerModel.afterUpdate(async (customer) => {
    console.log(`📝 Customer updated: ID ${customer.id}`);
  });

  // ─── DELETE ──────────────────────────────
  CustomerModel.beforeDestroy(async (customer, options) => {
    console.log(`⚠️ Attempting to delete customer: ID ${customer.id}`);

    const orders = await customer.getOrders({
      where: {
        status: {
          [Sequelize.Op.not]: 'delivered',
        },
      },
    });

    if (orders.length > 0) {
      console.log(`❌ Cannot delete customer ID ${customer.id} – has undelivered orders`);
      throw new Error('Cannot delete customer with undelivered orders');
    }
  });

  CustomerModel.afterDestroy(async (customer) => {
    console.log(`🗑️ Customer soft-deleted: ID ${customer.id}`);
  });

  // ─── RESTORE ─────────────────────────────
  CustomerModel.beforeRestore(async (customer) => {
    console.log(`🔁 Restoring customer: ID ${customer.id}`);
  });

  CustomerModel.afterRestore(async (customer) => {
    console.log(`♻️ Customer restored successfully: ID ${customer.id}`);
  });
};

module.exports = registerCustomerHooks;