const Merchant = require('../merchant/merchantSchema');
const Wallet = require('../models/walletSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongoose = require('mongoose');
const Transaction = require('../models/merchantTransaction');

// Function to generate a unique account reference
const generateAccountReference = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 20;
  let accountReference = 'PSA';

  while (accountReference.length < length) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    accountReference += characters[randomIndex];
  }

  return accountReference;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, mobilenumber, country } = req.body;

    const existingUser = await Merchant.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const merchant = new Merchant({ name, email, password });

    const headers = {
      Authorization: process.env.FLW_SECRET_KEY
    };

    const accountReference = generateAccountReference();

    const walletData = {
      account_name: name,
      email,
      mobilenumber,
      country,
      account_reference: accountReference
    };

    const response = await axios.post('https://api.flutterwave.com/v3/payout-subaccounts', walletData, { headers });

    merchant.account_reference = accountReference;
    merchant.wallet = response.data;
    await merchant.save();

    res.status(201).json({ message: 'Merchant registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register merchant' });
  }
};

exports.getMerchantDetails = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.json(merchant);
  } catch (error) {
    console.error('Error retrieving merchant:', error);
    res.status(500).json({ error: 'Failed to retrieve merchant' });
  }
};

exports.getMerchantTransactions = async (req, res, next) => {
  const merchantId = req.params.merchantId;

  if (!mongoose.Types.ObjectId.isValid(merchantId)) {
    return res.status(400).json({ message: 'Invalid merchantId' });
  }

  try {
    const transactions = await Transaction.find({ merchant: merchantId });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch merchant transactions' });
  }
};

exports.updateMerchantBalance = async (req, res, next) => {
  const merchantId = req.params.merchantId;

  if (!mongoose.Types.ObjectId.isValid(merchantId)) {
    return res.status(400).json({ message: 'Invalid merchantId' });
  }

  try {
    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    const previousBalance = merchant.balance;

    merchant.balance += req.body.balance;
    await merchant.save();

    const transaction = new Transaction({
      merchant: merchant._id,
      amount: req.body.balance,
      type: req.body.balance > 0 ? 'credit' : 'debit',
    });
    await transaction.save();

    res.json({ merchant, previousBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update merchant balance' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const merchant = await Merchant.findOne({ email });

    if (!merchant) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, merchant.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ merchantId: merchant._id }, 'your-secret-key', { expiresIn: '1h' });

    res.json({
      merchantId: merchant._id,
      token,
      merchant: {
        name: merchant.name,
        email: merchant.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

exports.creditMerchant = async (req, res) => {
  try {
    const { cardNumber, price } = req.body;

    const merchant = await Merchant.findOne({ cardNumber });

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    const user = await User.findOne({ cardNumber });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.balance -= price;
    await user.save();

    merchant.wallet.balance += price;
    await merchant.save();

    const transaction = new Transaction({
      user: user._id,
      merchant: merchant._id,
      amount: price,
      type: 'credit',
    });
    await transaction.save();

    return res.json({ message: 'Transaction successful' });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return res.status(500).json({ message: 'Failed to process transaction' });
  }
};

exports.getAllMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find();
    res.status(200).json(merchants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch merchants' });
  }
};
