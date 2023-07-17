// Import Mongoose and bcrypt
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define User schema
const merchantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  account_reference: {
    type: String,
    required: true
  },
  nuban: {
    type: String
  },
  bank_name: {
    type: String
  },
  bank_code: {
    type: String
  },
  status: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash and salt password before saving
merchantSchema.pre('save', async function (next) {
  const merchant = this;
  if (!merchant.isModified('password')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    const hash = await bcrypt.hash(merchant.password, salt);
    // Set hashed password
    merchant.password = hash;
    return next();
  } catch (err) {
    return next(err);
  }
});

// Create User model from schema
const Merchant = mongoose.model('User', merchantSchema);


module.exports = Merchant;
