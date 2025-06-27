const { Customer } = require('../models');
const client = require('../utils/redisClient'); // Reusable Redis client

const getAllCustomers = async (req, res) => {
  try {
    console.log('Checking Redis for cached customers...');

    // Step 1: Check Redis cache
    const cachedCustomers = await client.get('customers');

    if (cachedCustomers) {
      console.log('✅ Customers returned from Redis cache');
      return res.status(200).json(JSON.parse(cachedCustomers));
    }

    // Step 2: Fetch from DB if not cached
    const customers = await Customer.findAll({
      attributes: ['id', 'name', 'email'], // adjust fields if needed
    });
    console.log('Redis response for customers:', cachedCustomers);

    // Step 3: Store result in Redis with TTL (5 min)
    await client.set('customers', JSON.stringify(customers), {
      EX: 300, // 5 minutes
    });
    console.log('Caching customer data in Redis...');

    console.log('🛢️ Customers fetched from DB and cached');
    return res.status(200).json(customers);
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getAllCustomers };
