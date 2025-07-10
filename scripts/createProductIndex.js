const elasticClient = require('../elasticsearch/client');

const createIndex = async () => {
  const exists = await elasticClient.indices.exists({ index: 'products' });

  if (exists) {
    console.log('Index already exists');
    return;
  }

  await elasticClient.indices.create({
    index: 'products',
    body: {
      mappings: {
        properties: {
          name: {
            type: 'text',
            analyzer: 'standard' // allows full-text search
          },
          description: { type: 'text' },
          category: { type: 'keyword' },
          price: { type: 'float' },
          stock: { type: 'integer' }
        }
      }
    }
  });

  console.log('Product index created!');
};

createIndex().catch(console.error);
