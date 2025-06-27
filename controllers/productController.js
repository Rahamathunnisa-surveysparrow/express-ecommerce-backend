const { Product } = require('../models');
const client = require('../utils/redisClient');

const getAllProducts = async (req, res) => {
  try {
    // Step 1: Check Redis cache
    const cachedProducts = await client.get('products');

    if (cachedProducts) {
      console.log('✅ Products returned from Redis cache');
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    // Step 2: If not cached, fetch from DB
    const products = await Product.findAll({
      attributes: ['id', 'name', 'price'], // Add other fields if needed
    });

    // Step 3: Store the result in Redis with 5 min TTL
    await client.set('products', JSON.stringify(products), {
      EX: 300, // expires in 300 seconds = 5 minutes
    });

    console.log('🛢️ Products fetched from DB and cached');
    return res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getAllProducts };
