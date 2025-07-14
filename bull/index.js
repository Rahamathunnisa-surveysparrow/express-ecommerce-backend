const statusUpdateQueue = require('./queue/statusQueue'); 
const cancelOrderQueue = require('./queue/cancelQueue');  

const getStatusQueue = () => statusUpdateQueue;
const getCancelQueue = () => cancelOrderQueue;

module.exports = {
  getStatusQueue,
  getCancelQueue
};
