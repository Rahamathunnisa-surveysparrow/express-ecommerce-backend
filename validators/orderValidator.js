// validators/orderValidator.js
const { body } = require('express-validator');

exports.createOrderRules = [
  body('customer_id')
    .notEmpty().withMessage('Customer ID is required.')
    .isInt({ gt: 0 }).withMessage('Customer ID must be a positive integer.'),

  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required in the order.'),

  body('items.*.product_id')
    .notEmpty().withMessage('Product ID is required for each item.')
    .isInt({ gt: 0 }).withMessage('Product ID must be a positive integer.'),

  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required for each item.')
    .isInt({ gt: 0 }).withMessage('Quantity must be a positive integer.')
];

exports.updateOrderRules = [
  body('customer_id')
    .optional()
    .isInt({ gt: 0 }).withMessage('Customer ID must be a positive integer.'),

  body('items')
    .optional()
    .isArray().withMessage('Items must be an array.'),

  body('items.*.product_id')
    .optional()
    .isInt({ gt: 0 }).withMessage('Product ID must be a positive integer.'),

  body('items.*.quantity')
    .optional()
    .isInt({ gt: 0 }).withMessage('Quantity must be a positive integer.')
];
