const Rating = require('../models/Rating');
const Store = require('../models/Store');


exports.createRating = async (req, res) => {
  try {
    const { storeId, value, comment } = req.body;
    const userId = req.user._id;

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user has already rated this store
    const existingRating = await Rating.findOne({ user: userId, store: storeId });
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this store' });
    }

    // Create rating
    const rating = await Rating.create({
      user: userId,
      store: storeId,
      value,
      comment
    });

    // Add rating to store's ratings array
    store.ratings.push(rating._id);
    await store.save();

    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({
      message: 'Rating creation failed',
      error: error.message,
    });
  }
};

// @desc    Get all ratings for a store
// @route   GET /api/ratings/store/:storeId
// @access  Public
exports.getStoreRatings = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const ratings = await Rating.find({ store: storeId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(ratings);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch ratings',
      error: error.message,
    });
  }
};


exports.getUserStoreRating = async (req, res) => {
  try {
    const { userId, storeId } = req.params;
    
    // Check if user is requesting their own rating or is admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const rating = await Rating.findOne({ user: userId, store: storeId });
    
    if (rating) {
      res.json(rating);
    } else {
      res.status(404).json({ message: 'Rating not found' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch rating',
      error: error.message,
    });
  }
};


exports.updateRating = async (req, res) => {
  try {
    const { value, comment } = req.body;
    
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Explicitly prevent store owners from updating ratings
    if (req.user.role === 'storeOwner') {
      return res.status(403).json({ message: 'Store owners cannot update ratings' });
    }
    
    // Check if user is owner of the rating
    if (rating.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    rating.value = value || rating.value;
    rating.comment = comment || rating.comment;
    
    const updatedRating = await rating.save();
    
    res.json(updatedRating);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update rating',
      error: error.message,
    });
  }
};


exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    // Store owners can only delete their own ratings, not any others
    if (req.user.role === 'storeOwner' && rating.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Store owners cannot delete other users\' ratings' });
    }
    
    // Check if user is owner of the rating or admin
    if (rating.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Remove rating from store's ratings array
    await Store.findByIdAndUpdate(rating.store, {
      $pull: { ratings: rating._id }
    });
    
    await Rating.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Rating removed' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete rating',
      error: error.message,
    });
  }
};


exports.getAllRatings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const ratings = await Rating.find({})
      .populate('user', 'name')
      .populate('store', 'name')
      .sort({ createdAt: -1 });
    
    res.json(ratings);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch ratings',
      error: error.message,
    });
  }
}; 