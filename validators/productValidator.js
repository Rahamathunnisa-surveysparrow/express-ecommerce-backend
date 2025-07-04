const { body } = require('express-validator');

// Reusable rules for product fields
const nameRule = body('name')
  .notEmpty().withMessage('Name is required')
  .isString().withMessage('Name must be a string');

const descriptionRule = body('description')
  .optional()
  .isString().withMessage('Description must be a string');

const priceRule = body('price')
  .notEmpty().withMessage('Price is required')
  .isDecimal().withMessage('Price must be a valid decimal number');

const stockRule = body('stock')
  .notEmpty().withMessage('Stock is required')
  .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer');

// POST / create product
exports.createProductRules = [
  nameRule,
  descriptionRule,
  priceRule,
  stockRule
];

// PUT / full update product
exports.updateProductRules = [
  nameRule,
  descriptionRule,
  priceRule,
  stockRule
];

// PATCH / partial update product
exports.partialUpdateProductRules = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .notEmpty().withMessage('Name cannot be empty'),
    
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),

  body('price')
    .optional()
    .isDecimal().withMessage('Price must be a valid decimal'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];
