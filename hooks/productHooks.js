const { invalidateProductCache } = require('../utils/cacheHelpers');

const registerProductHooks = (ProductModel, _models) => {
  // ─── CREATE ───────────────────────────────────────
  ProductModel.afterCreate(async (product, options) => {
    console.log(`✅ Product created: ${product.name} (ID: ${product.id})`);
    await invalidateProductCache(product.id);
  });

  // ─── UPDATE (PUT/PATCH) ───────────────────────────
  ProductModel.beforeUpdate(async (product) => {
    if (product.changed('stock') && product.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }
  });

  ProductModel.afterUpdate(async (product, options) => {
    console.log(`🛠️ Product updated: ${product.name} (ID: ${product.id})`);
    await invalidateProductCache(product.id);
  });

  // ─── DELETE (SOFT DELETE) ─────────────────────────
  ProductModel.afterDestroy(async (product, options) => {
    console.log(`🗑️ Product soft-deleted: ${product.name} (ID: ${product.id})`);
    await invalidateProductCache(product.id);
  });

  // ─── RESTORE ──────────────────────────────────────
  ProductModel.afterRestore(async (product, options) => {
    console.log(`♻️ Product restored: ${product.name} (ID: ${product.id})`);
    await invalidateProductCache(product.id);
  });

  // ─── GENERIC LOGGING (Optional, but good for tracing) ───────────────
  ProductModel.beforeCreate(async (product) => {
    console.log(`📦 Creating product: ${product.name}`);
  });

  ProductModel.beforeDestroy(async (product) => {
    console.log(`⚠️ Soft-deleting product: ${product.name}`);
  });

  ProductModel.beforeRestore(async (product) => {
    console.log(`🔄 Restoring product: ${product.name}`);
  });
};

module.exports = registerProductHooks;
