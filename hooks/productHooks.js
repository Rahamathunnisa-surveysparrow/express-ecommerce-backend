const registerProductHooks = (ProductModel, _models) => {
  // Prevent setting negative stock
  ProductModel.beforeUpdate(async (product) => {
    if (product.changed('stock') && product.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }
  });

  // Log product deletion
  ProductModel.afterDestroy(async (product) => {
    console.log(`🗑️ Product '${product.name}' (ID: ${product.id}) soft-deleted`);
  });
};

module.exports = registerProductHooks;
