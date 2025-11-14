const ensureReviewIndexes = async (mongoose) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('reviews');
    const indexes = await collection.indexes();
    const existing = indexes.find((idx) => idx.name === 'product_1_user_1');

    if (existing) {
      // If this index exists, it was previously unique. Drop and recreate non-unique
      try {
        await collection.dropIndex('product_1_user_1');
      } catch (e) {
        // ignore if already dropped
      }
    }

    // Ensure a non-unique index exists for fast lookups
    await collection.createIndex({ product: 1, user: 1 }, { name: 'product_1_user_1' });
  } catch (err) {
    // Do not block server start on index fix
    console.error('Index ensure error (non-fatal):', err?.message || err);
  }
};

module.exports = { ensureReviewIndexes };


