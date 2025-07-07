const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { param } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createProductRules,
  updateProductRules,
  partialUpdateProductRules } = require('../validators/productValidator');


// Get all products
router.get('/', productController.getAllProducts);

// Get one product by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('Invalid product ID')],
  validateRequest,
  productController.getProductById
);

// Add new product
router.post(
  '/',
  createProductRules,
  validateRequest,
  productController.createProduct
);

// Full update (PUT)
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid product ID'),
    ...updateProductRules
  ],
  validateRequest,
  productController.updateProduct
);

// Partial update (PATCH)
router.patch(
  '/:id',
  [
    param('id').isInt().withMessage('Invalid product ID'),
    ...partialUpdateProductRules
  ],
  validateRequest,
  productController.patchProduct
);

// Soft delete product
router.delete(
  '/:id',
  [param('id').isInt().withMessage('Invalid product ID')],
  validateRequest,
  productController.softDeleteProduct
);

// Restore soft-deleted product
router.post(
  '/:id/restore',
  [param('id').isInt().withMessage('Invalid product ID')],
  validateRequest,
  productController.restoreProduct
);

module.exports = router;