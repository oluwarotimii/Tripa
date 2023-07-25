// Import required modules
const User = require('../models/userSchema');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const Wallet = require('../models/walletSchema')
// Import necessary modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongoose = require('mongoose');
const Transaction = require('../models/transactionSchema')
const BusCard = require('../models/BusCardSchema')






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
    // Extract user registration data from request body
    const { name, email, password, mobilenumber, country } = req.body;

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Create a new user object
    const user = new User({ name, email, password });

    // Create a new wallet through the Flutterwave API
    const headers = {
      Authorization: process.env.FLW_SECRET_KEY
    };

    const accountReference = generateAccountReference();

    const walletData = {
      account_name: name,
      email,
      mobilenumber, // Set the appropriate mobile number for the user
      country, // Set the appropriate country for the user
      account_reference: accountReference
    };

    const response = await axios.post('https://api.flutterwave.com/v3/payout-subaccounts', walletData, { headers });
    console.log(response.data);

    // Save the wallet details to the user
    user.account_reference = accountReference; // Save the account reference in the user schema
    user.wallet = response.data; // Assuming the response data contains the wallet details
    await user.save();

    // Return success response
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};



//DETAILS
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId; // Extract the user ID from the request parameters
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};



 
// Update balance


exports.updateUserBalance = async (req, res, next) => {
  const userId = req.params.userId;

  // Validate the userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const previousBalance = user.balance;

    // Add to the user's balance
    user.balance += req.body.balance;
    await user.save();

    // Create a new transaction record
    const transaction = new Transaction({
      user: user._id,
      amount: req.body.balance,
      type: req.body.balance > 0 ? 'credit' : 'debit',
      ref: 'Wallet',
    });
    await transaction.save();

    res.json({ user, previousBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user balance' });
  }
};


exports.getUserTransactions = async (req, res, next) => {
  const userId = req.params.userId;

  // Validate the userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    // Find all transactions for the user and sort by createdAt in descending order (newest first)
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user transactions' });
  }
};





// User Login
exports.login = async (req, res) => {
  try {
    // Extract user login data from request body
    const { email, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    // Return the user ID, token, name, and email in the response
    res.json({
      userId: user._id,
      token,
      user: {
        name: user.name,
        email: user.email,
        accountReference: user.account_reference
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to login' });
  }
};




// User Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    // Extract email from request body
    const { email } = req.body;

    // Find the user in the database
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate and send password reset link to user's email
    // ... implementation of password reset logic ...

    // Return success response
    res.json({ message: 'Password reset link sent successfully' });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to send password reset link' });
  }
};


// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users from User model
    const users = await User.find();

    // Send response with fetched users
    res.status(200).json(users);
  } catch (error) {
    // Handle error that may occur
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Edit User Name
exports.editUserName = async (req, res) => {
  const userId = req.params.userId;
  const newName = req.body.newName;

  try {
    // Authenticate user using middleware
    await AuthMiddleware.authenticate(req, res);

    // Find the user in the database
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user name
    user.name = newName;
    await user.save();

    // Return success response
    res.json({ message: 'User name updated successfully' });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to edit user name' });
  }
};


// Define the function to update user balance


// Define the rechargeBusCard function
exports.rechargeBusCard = async (req, res, next) => {
  const userId = req.params.userId;
  const busCardId = req.params.busCardId;
 

  try {
    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the bus card exists and belongs to the user
    const busCard = await BusCard.findOne({ _id: busCardId, owner: userId });
    if (!busCard) {
      return res.status(404).json({ message: 'Bus card not found' });
    }

    
    // Add to the user's balance
    user.balance -= req.body.balance;
    await user.save();
    
    // Credit the amount to the bus card's balance
    busCard.balance += amount;
    await busCard.save();
    // Save the changes
    
   

    // Create a new transaction record for the user
    const transaction = new Transaction({
      user: userId,
      amount: amount,
      type: 'debit',
      ref: 'Bus Card',
    });
    await transaction.save();
    
    res.json({ message: 'Bus card recharged successfully', user, previousBalance  });
    res.json({ user, previousBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to recharge the bus card' });
  }
};








// Withdraw from Bus Card
// Withdraw from Bus Card
// Withdraw from Bus Card
exports.cardWithdraw = async (req, res, next) => {
  const userId = req.params.userId;
  const busCardId = req.params.busCardId;
  const amount = req.body.amount;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the bus card exists and belongs to the user
    const busCard = await BusCard.findOne({ _id: busCardId, owner: userId });
    if (!busCard) {
      return res.status(404).json({ message: 'Bus card not found' });
    }

    // Check if the bus card has sufficient balance for withdrawal
    if (busCard.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance in the bus card' });
    }

    // Deduct the amount from the bus card balance
    busCard.balance -= amount;

    // Update the user's wallet balance by crediting the withdrawn amount
    user.balance += amount;

    // Save the changes
    await busCard.save();
    await user.save();

    // Create a new transaction record
    const transaction = new Transaction({
      user: userId,
      amount: amount,
      type: 'credit',
      ref: 'Bus Card', // Set the ref field to 'Bus Card'
    });
    await transaction.save();

    res.json({ message: 'Amount withdrawn from the bus card and credited to the user\'s wallet successfully', transaction, newBalance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to withdraw from the bus card and credit the user\'s wallet' });
  }
};



// CREDIT MERCHANT ENDPOINT FOR ACCEPTING PAYMENT
// exports.creditUser = async (req, res) => {
//   const receiverId = req.params.userId; // User ID of the receiver
//   const cardNumber = req.body.cardNumber; // Card number of user 2
//   const amount = req.body.amount;

//   try {
//     // Find the bus card associated with user 2's card number
//     const busCard = await BusCard.findOne({ cardNumber });
//     if (!busCard) {
//       console.error('Bus card not found');
//       return res.status(404).json({ message: 'Bus card not found' });
//     }

//     // Deduct the amount from user 2's bus card balance
//     busCard.balance -= amount;

//     // Find the user 1 (receiver) and credit the amount to their balance
//     await User.findByIdAndUpdate(receiverId, { $inc: { balance: amount } });

//     // Save the changes for user 2's bus card
//     await busCard.save();

//     // Create a transaction record for user 2
//     const senderTransaction = new Transaction({
//       user: busCard.owner, // User ID of user 2
//       amount,
//       type: 'debit',
//       counterParty: receiverId, // Set the counterParty as the receiver's ID
//       ref: 'Bus Card',
//     }
//     );
//     await senderTransaction.save();

//     // Create a transaction record for user 1
//     const receiverTransaction = new Transaction({
//       user: receiverId,
//       amount,
//       type: 'credit',
//       ref: 'Wallet',
//       counterParty: busCard.owner // Set the counterParty as the user 2's ID
//     });
//     await receiverTransaction.save();

//     res.json({ message: 'User credited successfully' });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Failed to credit the user' });
//   }
// };

exports.creditUser = async (req, res) => {
  const receiverId = req.params.userId; // User ID of the receiver
  const cardNumber = req.body.cardNumber; // Card number of user 2
  const amount = req.body.amount;

  try {
    // Find the bus card associated with user 2's card number
    const busCard = await BusCard.findOne({ cardNumber });
    if (!busCard) {
      console.error('Bus card not found');
      return res.status(404).json({ message: 'Bus card not found' });
    }

    // Check if the bus card is active
    if (!busCard.isActive) {
      console.error('Bus card is not active');
      return res.status(400).json({ message: 'Bus card is not active. Transaction declined.' });
    }

    // Check if the bus card balance is sufficient for the transaction
    if (busCard.balance < amount) {
      console.error('Insufficient balance in the bus card');
      return res.status(400).json({ message: 'Insufficient balance in the bus card. Transaction declined.' });
    }

    // Deduct the amount from user 2's bus card balance
    busCard.balance -= amount;

    // Find the user 1 (receiver) and credit the amount to their balance
    await User.findByIdAndUpdate(receiverId, { $inc: { balance: amount } });

    // Save the changes for user 2's bus card
    await busCard.save();

    // Create a transaction record for user 2
    const senderTransaction = new Transaction({
      user: busCard.owner, // User ID of user 2
      amount,
      type: 'debit',
      counterParty: receiverId, // Set the counterParty as the receiver's ID
      ref: 'Bus Card',
    });
    await senderTransaction.save();

    // Create a transaction record for user 1
    const receiverTransaction = new Transaction({
      user: receiverId,
      amount,
      type: 'credit',
      ref: 'Wallet',
      counterParty: busCard.owner, // Set the counterParty as the user 2's ID
    });
    await receiverTransaction.save();

    res.json({ message: 'User credited successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to credit the user' });
  }
};













