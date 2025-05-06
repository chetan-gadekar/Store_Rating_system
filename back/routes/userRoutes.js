const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getDashboardData
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes
router.get('/', protect, admin, getUsers);
router.get('/dashboard', protect, admin, getDashboardData);
router.get('/:id', protect, admin, getUserById);
router.post('/', protect, admin, createUser);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
