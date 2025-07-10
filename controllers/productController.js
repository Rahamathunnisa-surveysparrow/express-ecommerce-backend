const { Product } = require('../models');
const paginate = require('../utils/paginate');
const redisClient = require('../utils/redisClient');
const client = require('../elasticsearch/client');

const getAllProducts = async (req, res) => {
  try {
    const { limit, offset, page } = paginate(req);

    const { count, rows } = await Product.findAndCountAll({
      limit,
      offset,
      where: { deletedAt: null },
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
// Get one product with cache
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`🔁 Served product ${id} from cache`);
      return res.status(200).json(JSON.parse(cached));
    }

    const product = await Product.findByPk(id, { paranoid: false });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    await redisClient.set(cacheKey, JSON.stringify(product), {
      EX: 300, // cache for 5 minutes
    });

    console.log(`📦 Cached product ${id}`);
    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

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

const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.destroy();
    res.json({ message: 'Product soft-deleted' });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

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

const searchProducts = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Missing search query' });
  }

  try {
    const result = await client.search({
      index: 'products',
      query: {
        multi_match: {
          query,
          fields: ['name^2', 'description'], // ^2 boosts name relevance
          fuzziness: 'auto'
        }
      }
    });

    const hits = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    return res.json({ results: hits });
  } catch (err) {
    console.error('Elasticsearch search error:', err);
    return res.status(500).json({ message: 'Search failed' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  softDeleteProduct,
  restoreProduct,
  searchProducts,
};
