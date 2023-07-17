// Import Mongoose and bcrypt
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define User schema
const userSchema = new mongoose.Schema({
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
  busCards: [
    {
      cardNumber: {
        type: Number,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      },
      balance: {
        type: Number,
        default: 0
      },
      created_at: {
        type: Date,
        default: Date.now
      }
    }
  ],
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
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    const hash = await bcrypt.hash(user.password, salt);
    // Set hashed password
    user.password = hash;
    return next();
  } catch (err) {
    return next(err);
  }
});

// Create User model from schema
const User = mongoose.model('User', userSchema);

// Export User model
module.exports = User;
