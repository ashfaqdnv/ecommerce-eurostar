const { products } = require('./store');

class Product {
  static findById(id) {
    return products.find((product) => product.id === id) || null;
  }

  static findAll() {
    return products;
  }

  static reduceStock(id, quantity) {
    const product = Product.findById(id);
    if (!product) return false;
    if (product.stock < quantity) return false;
    product.stock -= quantity;
    return true;
  }
}

module.exports = Product;
