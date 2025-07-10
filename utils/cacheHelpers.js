const redisClient = require('./redisClient');

const invalidateOrderCache = async (orderId) => {
  try {
    await redisClient.del(`order:${orderId}`);
    console.log(`🧹 Order cache invalidated: order:${orderId}`);
  } catch (err) {
    console.error(`❌ Failed to invalidate order cache: ${orderId}`, err);
  }
};

const invalidateProductCache = async (productId) => {
  try {
    await redisClient.del(`product:${productId}`);
    console.log(`🧹 Product cache invalidated: product:${productId}`);
  } catch (err) {
    console.error(`❌ Failed to invalidate product cache: ${productId}`, err);
  }
};

module.exports = {
  invalidateOrderCache,
  invalidateProductCache,
};
