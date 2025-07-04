'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'createdAt', 'created_at');
    await queryInterface.renameColumn('products', 'updatedAt', 'updated_at');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('products', 'created_at', 'createdAt');
    await queryInterface.renameColumn('products', 'updated_at', 'updatedAt');
  }
};
