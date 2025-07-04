'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'quantity', 'stock');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'stock', 'quantity');
  }
};
