const registerCustomerHooks = require('../hooks/customerHooks');

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

  Customer.associate = (models) => {
    Customer.hasMany(models.Order, {
      foreignKey: 'customer_id',
      as: 'orders'
    });

    // ✅ Register hooks with models passed
    registerCustomerHooks(Customer, models);
  };

  Customer.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return Customer;
};
