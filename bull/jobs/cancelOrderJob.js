const { cancelOrderQueue } = require('../index');

const cancelOrder = (orderId, reason) => {
  cancelOrderQueue.add({ orderId, reason });
};

module.exports = cancelOrder;
