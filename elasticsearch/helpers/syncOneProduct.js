const client = require('../client');

module.exports = async function syncToElasticsearch(product) {
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
};
