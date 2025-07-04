'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('orders', 'createdAt', 'created_at');
    await queryInterface.renameColumn('orders', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('orders', 'deletedAt', 'deleted_at');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('orders', 'created_at', 'createdAt');
    await queryInterface.renameColumn('orders', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('orders', 'deleted_at', 'deletedAt');
  }
};
