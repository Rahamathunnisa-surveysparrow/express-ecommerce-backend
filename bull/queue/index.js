// bull/queue/index.js
const statusUpdateQueue = require('./statusQueue');
const cancelOrderQueue = require('./cancelQueue');

const getStatusQueue = () => statusUpdateQueue;
const getCancelQueue = () => cancelOrderQueue;

module.exports = {
  getStatusQueue,
  getCancelQueue
};
