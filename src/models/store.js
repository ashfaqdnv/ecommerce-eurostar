const bcrypt = require('bcryptjs');

const users = [];
const products = [];

let nextUserId = 1;
let nextProductId = 1;

function seedUsers() {
  const seedData = [
    { email: 'alice@example.com', password: 'password123', name: 'Alice Johnson' },
    { email: 'bob@example.com', password: 'password123', name: 'Bob Smith' },
    { email: 'carol@example.com', password: 'password123', name: 'Carol Williams' },
  ];

  seedData.forEach(({ email, password, name }) => {
    users.push({
      id: nextUserId++,
      email,
      password: bcrypt.hashSync(password, 10),
      name,
    });
  });
}

function seedProducts() {
  const seedData = [
    { name: 'Wireless Headphones', price: 79.99, stock: 50 },
    { name: 'Smart Watch', price: 199.99, stock: 30 },
    { name: 'USB-C Hub', price: 34.99, stock: 100 },
  ];

  seedData.forEach(({ name, price, stock }) => {
    products.push({
      id: nextProductId++,
      name,
      price,
      stock,
    });
  });
}

seedUsers();
seedProducts();

module.exports = {
  users,
  products,
  getNextUserId: () => nextUserId++,
};
