// const { Order } = require('../models');
// const moment = require('moment');

// const fixOrderStatuses = async () => {
//   const orderIds = [24, 25, 26, 27];

//   const orders = await Order.findAll({ where: { id: orderIds }, paranoid: false });

//   const now = moment();

//   for (const order of orders) {
//     if (order.deletedAt) {
//       console.log(`❌ Skipping Order #${order.id} (soft-deleted)`);
//       continue;
//     }

//     const created = moment(order.createdAt);
//     const hoursDiff = now.diff(created, 'hours');
//     let newStatus;

//     if (hoursDiff >= 3) {
//       newStatus = 'delivered';
//     } else if (hoursDiff >= 2) {
//       newStatus = 'shipped';
//     } else if (hoursDiff >= 1) {
//       newStatus = 'processing';
//     } else {
//       newStatus = 'pending';
//     }

//     if (order.status === newStatus) {
//       console.log(`✅ Order #${order.id} is already '${newStatus}'`);
//     } else {
//       await order.update({ status: newStatus });
//       console.log(`🔁 Order #${order.id} updated from '${order.status}' to '${newStatus}'`);
//     }
//   }

//   process.exit();
// };

// fixOrderStatuses().catch(err => {
//   console.error('❌ Failed to update statuses:', err);
//   process.exit(1);
// });



const { scheduleStatusUpdateJob } = require('../bull/jobs/statusUpdateJob');

// const { scheduleStatusUpdateJob } = require('../bull/jobs/orderStatusJob');

(async () => {
  try {
    const orderId = 29;
    await scheduleStatusUpdateJob(orderId, 'processing', 0);    // Immediate
    await scheduleStatusUpdateJob(orderId, 'shipped', 60);      // +1 min
    await scheduleStatusUpdateJob(orderId, 'delivered', 120);   // +2 min
    console.log("✅ Status update jobs rescheduled for order #29");
  } catch (error) {
    console.error("❌ Failed to reschedule order #29 jobs:", error);
  }
})();
