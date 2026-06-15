const authService = require('../services/authService');

function register(req, res) {
  try {
    const result = authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

function login(req, res) {
  try {
    const result = authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
}

module.exports = { register, login };
