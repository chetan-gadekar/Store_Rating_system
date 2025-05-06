const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [60, 'Name cannot exceed 60 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(v) {
        return /^(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(v);
      },
      message: 'Password must include at least one uppercase letter and one special character'
    }
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    maxlength: [400, 'Address cannot exceed 400 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'storeOwner'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' } // Make sure to have a Department model
});

// Hash password before saving to DB
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
