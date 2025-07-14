const statusUpdateQueue = require('./queue/statusQueue'); // fixed path
const cancelOrderQueue = require('./queue/cancelQueue');  // if you have it

const getStatusQueue = () => statusUpdateQueue;
const getCancelQueue = () => cancelOrderQueue;

module.exports = {
  getStatusQueue,
  getCancelQueue
};
