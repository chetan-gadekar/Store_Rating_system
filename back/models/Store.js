const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a store name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    maxlength: [400, 'Address cannot exceed 400 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating'
  }],
  overallRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a method to calculate the overall rating
storeSchema.methods.calculateOverallRating = async function() {
  const Rating = mongoose.model('Rating');
  const ratings = await Rating.find({ store: this._id });
  
  if (ratings.length === 0) {
    this.overallRating = 0;
    return;
  }
  
  const sum = ratings.reduce((total, rating) => total + rating.value, 0);
  this.overallRating = (sum / ratings.length).toFixed(1);
  await this.save();
};

module.exports = mongoose.model('Store', storeSchema); 