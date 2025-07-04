'use strict';

module.exports = {

  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
      customer_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'customers',
              key: 'id'
            },
            onUpdate: 'CASCADE'
          },
      total_price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
          },
      createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
      updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
      deletedAt: {
            type: Sequelize.DATE,
            allowNull: true
          }
        });
      },


  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }

};