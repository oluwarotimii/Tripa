const mongoose = require('mongoose');

const merchantTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
  },
  { timestamps: true }
);

const merchantTransaction = mongoose.model('Transaction', merchantTransactionSchema);

module.exports = merchantTransaction;
