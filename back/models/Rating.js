const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  value: {
    type: Number,
    required: [true, 'Please add a rating value'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [300, 'Comment cannot exceed 300 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// A user can only rate a store once
ratingSchema.index({ user: 1, store: 1 }, { unique: true });

// Update store's overall rating after a rating is saved
ratingSchema.post('save', async function() {
  const Store = mongoose.model('Store');
  const store = await Store.findById(this.store);
  if (store) {
    await store.calculateOverallRating();
  }
});

// Update store's overall rating after a rating is removed
ratingSchema.post('remove', async function() {
  const Store = mongoose.model('Store');
  const store = await Store.findById(this.store);
  if (store) {
    await store.calculateOverallRating();
  }
});

module.exports = mongoose.model('Rating', ratingSchema); 