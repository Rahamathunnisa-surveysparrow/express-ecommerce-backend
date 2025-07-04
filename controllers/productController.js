const { Product } = require('../models');
const paginate = require('../utils/paginate');

const getAllProducts = async (req, res) => {
  try {
    const { limit, offset, page } = paginate(req);

    const { count, rows } = await Product.findAndCountAll({
      limit,
      offset,
      where: { deletedAt: null }, // if using soft delete
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        perPage: limit,
        totalItems: count,

      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

// Get one product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, { paranoid: false });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    const product = await Product.create({ name, description, price, stock });
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update entire product (PUT)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.update({ name, description, price, stock });
    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Partial update (PATCH)
const patchProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.update(updates);
    res.json({ message: 'Product partially updated', product });
  } catch (error) {
    console.error("❌ Error patching product:", error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Soft-delete product
const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.destroy(); // Will set deletedAt if paranoid: true
    res.json({ message: 'Product soft-deleted' });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Restore soft-deleted product
const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, { paranoid: false });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.restore();
    res.json({ message: 'Product restored successfully', product });
  } catch (error) {
    console.error("❌ Error restoring product:", error);
    res.status(500).json({ error: 'Failed to restore product' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  softDeleteProduct,
  restoreProduct
};
