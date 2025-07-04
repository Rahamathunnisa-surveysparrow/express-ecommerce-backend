// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const authenticateCustomer = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');
const { param, body } = require('express-validator');
const orderValidator = require('../validators/orderValidator');

// Public Routes (optional - can be restricted if needed)
router.get('/', authenticateCustomer, orderController.getAllOrders);
 
// Protected Routes

// Get orders by customer (only their own)
router.get(
  '/customer/:id',
  [param('id').isInt().withMessage('Invalid customer ID')],
  authenticateCustomer,
  orderController.getOrdersByCustomer
);

// Get order by ID (only if owned by the customer)
router.get(
  '/:id',
  [param('id').isInt().withMessage('Invalid order ID')],
  authenticateCustomer,
  orderController.getOrderById
);

// Get order by status (only if owned by the customer)
router.get(
  '/status/:status',
  [param('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')],
  authenticateCustomer,
  orderController.getOrdersByStatus
);

// Create a new order
router.post(
  '/',
  orderValidator.createOrderRules,
  authenticateCustomer,
  orderController.createOrder
);

// Full update (PUT) of an order
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid order ID'),
    ...orderValidator.updateOrderRules
  ],
  authenticateCustomer,
  orderController.updateOrder
);

// Partial update (PATCH) - only status
router.patch(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid order ID'),
    body('status')
      .optional()
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status')
  ],
  authenticateCustomer,
  orderController.patchOrderStatus
);

// Soft delete an order
router.delete(
  '/:id',
  [param('id').isInt().withMessage('Invalid order ID')],
  authenticateCustomer,
  orderController.softDeleteOrder
);

// Restore a soft-deleted order
router.post(
  '/:id/restore',
  [param('id').isInt().withMessage('Invalid order ID')],
  authenticateCustomer,
  orderController.restoreOrder
);

module.exports = router;
