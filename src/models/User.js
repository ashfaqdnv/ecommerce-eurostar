const { users, getNextUserId } = require('./store');

class User {
  static findByEmail(email) {
    return users.find((user) => user.email === email) || null;
  }

  static findById(id) {
    return users.find((user) => user.id === id) || null;
  }

  static create({ email, password, name }) {
    const user = {
      id: getNextUserId(),
      email,
      password,
      name,
    };
    users.push(user);
    return user;
  }

  static toPublic(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}

module.exports = User;
