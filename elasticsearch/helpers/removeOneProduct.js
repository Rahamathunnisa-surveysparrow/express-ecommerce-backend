const client = require('../client');

module.exports = async function removeFromElasticsearch(productId) {
  try {
    await client.delete({
      index: 'products',
      id: productId,
    });
  } catch (err) {
    if (err.meta?.statusCode !== 404) {
      console.error(`❌ Failed to remove product ${productId} from Elasticsearch`, err);
    }
  }
};
