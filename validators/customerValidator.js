const { body } = require('express-validator');

// For PATCH (partial update)
exports.updateCustomerRules = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),

  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email address.'),

  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
];

// For PUT (full update — all fields required)
exports.fullUpdateCustomerRules = [
  body('name')
    .notEmpty().withMessage('Name is required.')
    .isString().withMessage('Name must be a string.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),

  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
];
