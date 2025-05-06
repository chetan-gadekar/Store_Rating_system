const express = require('express');
const router = express.Router();
const { 
  createRating, 
  getStoreRatings, 
  getUserStoreRating, 
  updateRating, 
  deleteRating,
  getAllRatings
} = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/store/:storeId', getStoreRatings);

// Protected routes
router.post('/', protect, createRating);
router.get('/', protect, getAllRatings);
router.get('/user/:userId/store/:storeId', protect, getUserStoreRating);
router.put('/:id', protect, updateRating);
router.delete('/:id', protect, deleteRating);

module.exports = router; 