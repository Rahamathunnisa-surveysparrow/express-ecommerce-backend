// utils/indexProducts.js
const client = require('../elasticsearch/client');
const { Product } = require('../models'); // Sequelize Product model

const indexProducts = async () => {
  const products = await Product.findAll();

  for (const product of products) {
    await client.index({
      index: 'products',
      id: product.id,
      document: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock
      }
    });
  }

  console.log('✅ All products indexed to Elasticsearch');
};

indexProducts()
  .catch(console.error)
  .finally(() => process.exit());
