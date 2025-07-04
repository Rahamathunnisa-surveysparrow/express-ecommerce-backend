const redisClient = require('./redisClient'); 

const invalidateOrderCache = async (orderId) => {
  try {
    await redisClient.del(`order:${orderId}`);
    console.log(`🧹 Cache invalidated for order:${orderId}`);
  } catch (err) {
    console.error(`❌ Failed to invalidate order cache for ${orderId}:`, err);
  }
};

module.exports = {
  invalidateOrderCache,
};
