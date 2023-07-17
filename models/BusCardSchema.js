const mongoose = require('mongoose');

const busCardSchema = new mongoose.Schema({
  cardNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  balance: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const BusCard = mongoose.model('BusCard', busCardSchema);

module.exports = BusCard;
