const express = require('express');
const router = express.Router();
const { 
  createStore, 
  getStores, 
  getStoreById, 
  updateStore, 
  deleteStore,
  getStoresByOwner
} = require('../controllers/storeController');
const { protect, admin, storeOwner } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getStores);
router.get('/:id', getStoreById);

// Admin routes
router.post('/', protect, admin, createStore);
router.delete('/:id', protect, admin, deleteStore);

// Store owner or admin routes
router.put('/:id', protect, updateStore);

// Store owner specific routes
router.get('/owner/:ownerId', protect, getStoresByOwner);

module.exports = router; 