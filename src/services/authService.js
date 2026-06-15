const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-eurostar-secret';
const JWT_EXPIRES_IN = '1h';

function generateToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function register({ email, password, name }) {
  if (!email || !password || !name) {
    const error = new Error('Email, password, and name are required');
    error.statusCode = 400;
    throw error;
  }

  if (User.findByEmail(email)) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = User.create({ email, password: hashedPassword, name });

  return {
    user: User.toPublic(user),
    token: generateToken(user),
  };
}

function login({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = User.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return {
    user: User.toPublic(user),
    token: generateToken(user),
  };
}

module.exports = {
  register,
  login,
  JWT_SECRET,
};
