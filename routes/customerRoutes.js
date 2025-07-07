const express = require('express');
const router = express.Router();
const { authenticateCustomer, allowSoftDeletedCustomer } = require('../middlewares/authMiddleware');
const customerController = require('../controllers/customerController');
const { param } = require('express-validator');
const { updateCustomerRules, fullUpdateCustomerRules } = require('../validators/customerValidator');
const { validateRequest } = require('../middlewares/validateRequest');


// Get all customers
router.get('/', customerController.getAllCustomers);

// Get one customer by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('Invalid customer ID')],
  validateRequest,
  authenticateCustomer,
  customerController.getCustomerById
);

// Full update (PUT)
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid customer ID'),
    ...fullUpdateCustomerRules
  ],
  validateRequest,
  authenticateCustomer,
  customerController.updateCustomer
);

// Partial update (PATCH)
router.patch(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid customer ID'),
    ...updateCustomerRules
  ],
  validateRequest,
  authenticateCustomer,
  customerController.patchCustomer
);

// Soft Delete customer
router.delete(
  '/:id',
  [param('id').isInt().withMessage('Invalid customer ID')],
  validateRequest,
  authenticateCustomer,
  customerController.softDeleteCustomer
);

router.post(
  '/:id/restore',
  [param('id').isInt().withMessage('Invalid customer ID')],
  validateRequest,
  allowSoftDeletedCustomer, // instead of authenticateCustomer
  customerController.restoreCustomer
);


module.exports = router;
