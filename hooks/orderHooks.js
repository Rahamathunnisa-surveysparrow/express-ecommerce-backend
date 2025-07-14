const { invalidateOrderCache } = require('../utils/cacheHelpers');
const { scheduleStatusUpdateJob } = require('../bull/jobs/statusUpdateJob');

const registerOrderHooks = (OrderModel, models) => {
  // 🔁 After order is created
  OrderModel.afterCreate(async (order) => {
    console.log(`📝 Order created with ID: ${order.id}`);

    // Invalidate Redis cache (precautionary — should be empty on create)
    await invalidateOrderCache(order.id);

    // Schedule status update job
    scheduleStatusUpdateJob(order.id, order.status || 'pending');
  });

  // 🔄 After order update
  OrderModel.afterUpdate(async (order) => {
    console.log(`✏️ Order updated. ID: ${order.id}, Status: ${order.status}`);

    await invalidateOrderCache(order.id);
  });

  // 🗑️ After soft delete
  OrderModel.afterDestroy(async (order) => {
    console.log(`🗑️ Order soft-deleted. ID: ${order.id}`);

    await invalidateOrderCache(order.id);
  });

  // ♻️ After restore
  OrderModel.afterRestore(async (order) => {
    console.log(`♻️ Order restored. ID: ${order.id}`);

    await invalidateOrderCache(order.id);

    // Job will also be scheduled from controller after transaction.commit
  });
};

module.exports = registerOrderHooks;