// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isSuperAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'superAdmin') {
      return res.status(401).json({ message: 'Not authorized as super admin' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};       

exports.isDepartmentAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized as department admin' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.isEmployee = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'employee') {
      return res.status(401).json({ message: 'Not authorized as employee' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
