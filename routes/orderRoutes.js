const express = require("express");
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require("../middlewares/authMiddleware");
const { body, validationResult } = require('express-validator');

const { createOrder, getOrdersByCustomer } = require("../controllers/orderController");

// Create order (with auth + validation)
router.post(
  '/',
  authMiddleware,
  [
    body('customer_id')
      .isInt({ gt: 0 })
      .withMessage('Customer ID must be a positive integer'),

    body('items')
      .isArray({ min: 1 })
      .withMessage('Items must be a non-empty array'),

    body('items.*.product_id')
      .isInt({ gt: 0 })
      .withMessage('Each item must have a valid product_id'),

    body('items.*.quantity')
      .isFloat({ gt: 0 })
      .withMessage('Each item must have a positive quantity'),

    body('items.*.price')
      .isFloat({ gt: 0 })
      .withMessage('Each item must have a valid price')
  ],
  orderController.createOrder
);



// Get orders by customer ID
router.get("/customer/:id", authMiddleware, getOrdersByCustomer);

// Add this line to fetch all orders (protected or public)
router.get('/', orderController.getAllOrders);

// Create order
router.post("/", authMiddleware, createOrder);

// Delete order by ID (no auth required here; add auth if needed)
const { deleteOrder } = require('../controllers/orderController');
router.delete('/:id', orderController.deleteOrder);

module.exports = router;