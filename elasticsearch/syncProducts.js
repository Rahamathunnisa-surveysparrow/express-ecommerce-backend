// elasticsearch/syncProducts.js
const client = require('./client');
const { Product } = require('../models');

const syncProductsToElasticsearch = async () => {
  try {
    const indexExists = await client.indices.exists({ index: 'products' });

    if (!indexExists) {
      console.log('📦 Creating "products" index...');
      await client.indices.create({ index: 'products' });
    }

    console.log('🔄 Syncing products from DB to Elasticsearch...');
    const products = await Product.findAll();

    const operations = products.flatMap(product => [
      { index: { _index: 'products', _id: product.id } },
      {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock
      }
    ]);

    if (operations.length > 0) {
      await client.bulk({ refresh: true, operations });
      console.log(`✅ Synced ${products.length} products to Elasticsearch.`);
    } else {
      console.log('ℹ️ No products to sync.');
    }
  } catch (error) {
    console.error('❌ Failed to sync products to Elasticsearch:', error);
  }
};

module.exports = syncProductsToElasticsearch;
