// elasticsearch/syncProducts.js
const client = require('./client'); // Elasticsearch client instance
const { Product } = require('../models');

const syncProductsToElasticsearch = async () => {
  try {
    const indexExists = await client.indices.exists({ index: 'products' });

    if (!indexExists) {
      console.log('📦 Creating "products" index...');
      await client.indices.create({ index: 'products' });
    }

    console.log('🔄 Syncing products from DB to Elasticsearch...');
    const products = await Product.findAll(); // use Sequelize to get all products from PostgreSQL.

    // flatMap() flattens the array so it's in the required alternating structure
    const operations = products.flatMap(product => [
      { index: { _index: 'products', _id: product.id } },
      {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock
      }
    ]);

    // Bulk API is used for efficiently inserting/updating many documents at once
    if (operations.length > 0) { 
      await client.bulk({ refresh: true, operations }); //refresh: true makes the changes immediately searchable  
      console.log(`✅ Synced ${products.length} products to Elasticsearch.`);
    } else {
      console.log('ℹ️ No products to sync.');
    }
  } catch (error) {
    console.error('❌ Failed to sync products to Elasticsearch:', error);
  }
};

module.exports = syncProductsToElasticsearch;
