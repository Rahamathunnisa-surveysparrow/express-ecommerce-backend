'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('products', [
      {
        name: 'Laptop',
        description: 'High performance laptop',
        price: 799.99,
        stock: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Tablet',
        description: 'Portable tablet',
        price: 499.99,
        stock: 15,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Headphones',
        description: 'Noise cancelling headphones',
        price: 199.99,
        stock: 20,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Smartwatch',
        description: 'Fitness tracking smartwatch',
        price: 149.99,
        stock: 30,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Power Bank',
        description: '10000mAh power bank',
        price: 29.99,
        stock: 50,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
