// WalletController.js

// Import required modules
const axios = require('axios');

const Wallet = require('../models/walletSchema');
const Transaction = require('../models/transactionSchema');
const User = require('../models/userSchema'); 
// const FlwWallet = require('./flutterwave')
const bodyParser = require('body-parser');
require('dotenv').config();
// const AuthMiddleware = require('../middlewares/AuthMiddleware');

// exports.createWallet = async (req, res) => {
//   try {
//     const { account_name, email, mobilenumber, country } = req.body;
//     const headers = {
//       Authorization: process.env.FLW_SECRET_KEY // Replace with your actual secret key
//     };
//     const data = {
//       account_name,
//       email,
//       mobilenumber,
//       "country": "NG"
//     };
    
//     const response = await axios.post('https://api.flutterwave.com/v3/payout-subaccounts', data, { headers });
//     console.log(response.data);
//     // Handle success response here
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error(error);
//     // Handle error response here
//     res.status(500).json({ status: 'error', message: error.message, data: null });
//   }
// };const Wallet = require('../models/Wallet'); // Import your Wallet model

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




exports.createWallet = async (req, res) => {
  try {
    const { account_name, email, mobilenumber, country } = req.body;
    const headers = {
      Authorization: process.env.FLW_SECRET_KEY
    };

    let accountReference;
    let existingWallet;
    do {
      // Generate a new account reference
      accountReference = generateAccountReference();

      // Check if account reference already exists in the database
      existingWallet = await Wallet.findOne({ account_reference: accountReference });
    } while (existingWallet);

    const data = {
      account_name,
      email,
      mobilenumber,
      country,
      account_reference: accountReference
    };

    const response = await axios.post('https://api.flutterwave.com/v3/payout-subaccounts', data, { headers });
    console.log(response.data);

    // Create a new wallet in the database
    const newWallet = new Wallet(data);
    await newWallet.save();

    // Handle success response here
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    // Handle error response here
    res.status(500).json({ status: 'error', message: error.message, data: null });
  }
};



exports.getAllWallets = async (req, res) => {
  try {
    const headers = {
      Authorization: process.env.FLW_SECRET_KEY // Replace with your actual secret key
    };
    const response = await axios.get('https://api.flutterwave.com/v3/payout-subaccounts', { headers });
    const responseData = response.data;

    console.log('Response data:', responseData); // Logging the response data for debugging

    if (!Array.isArray(responseData.data)) {
      throw new Error('Invalid response data. Wallets data is not an array.');
    }

    const wallets = responseData.data;

    // Save the wallets to the database
    await Wallet.insertMany(wallets);

    // Send the wallets data back in the response
    res.status(200).json({ status: 'success', message: 'Wallets retrieved and saved successfully', data: wallets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message, data: null });
  }
};





// };
exports.saveAllWallets = async (req, res) => {
  try {
    const headers = {
      Authorization: process.env.FLW_SECRET_KEY // Replace with your actual secret key
    };
    const response = await axios.get('https://api.flutterwave.com/v3/payout-subaccounts', { headers });
    const responseData = response.data;

    console.log('Response data:', responseData); // Logging the response data for debugging

    if (!Array.isArray(responseData.data)) {
      throw new Error('Invalid response data. Wallets data is not an array.');
    }

    const walletsData = responseData.data;

    for (const walletData of walletsData) {
      const filter = { account_reference: walletData.account_reference };
      const update = {
        accountName: walletData.account_name,
        barterId: walletData.barter_id,
        email: walletData.email,
        mobileNumber: walletData.mobilenumber,
        country: walletData.country,
        nuban: walletData.nuban,
        bankName: walletData.bank_name,
        bankCode: walletData.bank_code,
        status: walletData.status,
        createdAt: walletData.created_at
      };

      await Wallet.findOneAndUpdate(filter, update, { new: true });
    }

    console.log('Wallets updated successfully');

    // Retrieve all wallets with user information from the database
    const wallets = await Wallet.find().populate('userId');

    res.status(200).json({ wallets }); // Send the wallets as a response to Postman
  } catch (error) {
    console.error('Error updating wallets:', error);
    res.status(500).json({ error: 'Failed to update wallets' }); // Send error response to Postman
  }
};




// Set Wallet Balance
exports.setWalletBalance = async (req, res) => {
  try {
    const walletId = req.params.walletId;
    
    // Logic to update the wallet balance to 0 in your preferred storage mechanism (e.g., a database)
    // Replace this logic with your actual implementation
    
    // Example logic using an imaginary database
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    wallet.balance = 0;
    await wallet.save();
    
    res.json({ message: 'Wallet balance set successfully', balance: 0 });
  } catch (error) {
    console.error('Error setting wallet balance:', error);
    res.status(500).json({ error: 'Failed to set wallet balance' });
  }
};

exports.addFundsToWallet = async (req, res) => {
  try {
    const walletId = req.params.walletId;
    const { amount } = req.body;
    
    // Logic to add funds to the wallet balance in your preferred storage mechanism (e.g., a database)
    // Replace this logic with your actual implementation
    
    // Example logic using an imaginary database
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    wallet.balance += amount;
    await wallet.save();
    
    res.json({ message: 'Funds added to wallet successfully', balance: wallet.balance });
  } catch (error) {
    console.error('Error adding funds to wallet:', error);
    res.status(500).json({ error: 'Failed to add funds to wallet' });
  }
};





// Get the wallets of a specific User by their ID


// Get user wallets
exports.getUserWallets = async (req, res) => {
  try {
    const userId = req.params.userId; // Extracting userId from request parameters

    // Find wallets associated with the user ID
    const wallets = await Wallet.find({ userId });

    // Return the wallets as a response
    res.json(wallets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get user wallets' });
  }
};





// Get Wallet Balance
exports.getWalletBalance = async (req, res) => {
  try {
    const walletId = req.params.walletId;

    // Logic to retrieve the wallet balance from your preferred storage mechanism (e.g., a database)
    // Replace this logic with your actual implementation

    // Example logic using an imaginary database
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const balance = wallet.balance;

    res.json({ balance });
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(500).json({ error: 'Failed to get wallet balance' });
  }
};




// Create Transaction
exports.createTransaction = async (req, res) => {
  try {
    // Extract wallet ID from request params
    const walletId = req.params.walletId;

    // Authenticate user using middleware
    // await AuthMiddleware.authenticate(req, res);

    // Find the wallet in the database
    const wallet = await Wallet.findById(walletId);

    // Check if wallet exists
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Extract transaction details from request body
    const { type, amount, description } = req.body;

    // Create a new transaction for the wallet
    const transaction = new Transaction({ walletId, type, amount, description });
    await transaction.save();

    // Update wallet balance based on transaction type
    if (type === 'credit') {
      wallet.balance += amount;
    } else if (type === 'debit') {
      if (wallet.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance for transaction' });
      }
      wallet.balance -= amount;
    }
    await wallet.save();

    // Return success response
    res.json({ message: 'Transaction created successfully', transaction });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Get Transaction History
exports.getTransactionHistory = async (req, res) => {
  try {
    // Extract wallet ID from request params
    const walletId = req.params.walletId;

    // Authenticate user using middleware
    await AuthMiddleware.authenticate(req, res);

    // Find the wallet in the database
    const wallet = await Wallet.findById(walletId);

    // Check if wallet exists
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Find all transactions for the wallet
    const transactions = await Transaction.find({ walletId });

    // Return the transaction history
    res.json({ transactions });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to get transaction history' });
  }
};


// Get Transaction Details
exports.getTransactionDetails = async (req, res) => {
  try {
    // Extract wallet ID and transaction ID from request params
    const walletId = req.params.walletId;
    const transactionId = req.params.transactionId;
    
    // Authenticate user using middleware
    // await AuthMiddleware.authenticate(req, res);

    // Find the wallet in the database
    const wallet = await Wallet.findById(walletId);

    // Check if wallet exists
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Find the transaction in the database
    const transaction = await Transaction.findById(transactionId);

    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if the transaction belongs to the wallet
    if (transaction.walletId.toString() !== walletId.toString()) {
      return res.status(403).json({ error: 'Transaction does not belong to wallet' });
    }

    // Return the transaction details
    res.json({ transaction });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to get transaction details' });
  }
};





//ENCRYPTION
exports.fundVirtualAccount = async (req, res) => {
  
  try {
    const { amount, currency, paymentType, email, bankTransferCode, card } = req.body;
    let endpoint;
  
    // Set the endpoint URL based on the payment type
    if (paymentType === 'card') {
      endpoint = 'https://api.flutterwave.com/v3/charges?type=card';
    } else if (paymentType === 'bank_transfer') {
      endpoint = 'https://api.flutterwave.com/v3/charges?type=bank_transfer';
    } else if (paymentType === 'mono') {
      endpoint = 'https://api.flutterwave.com/v3/charges?type=mono';
    } else {
      throw new Error('Invalid payment type');
    }
  
    // Construct request payload
    let payload = {
      account_bank: 232,
      account_number: 6222060502, // Replace with actual virtual account number
      amount,
      currency,
      email,
      fullname: paymentType === 'card' ? card?.name : null,
      tx_ref: `V${Date.now()}`, // Generate a unique transaction reference
      redirect_url: `${process.env.BASE_URL}/fund-virtual-account/callback`,
      payment_type: paymentType // card or bank transfer
    };
  
    // Encrypt the card details if payment type is card
    if (paymentType === 'card' && card) {
      payload = encryptPayloadFields(payload, process.env.FLW_ENCRYPTION_KEY);
      payload.card_no_encrypted = true;
      payload.cvv_encrypted = true;
      payload.expiry_month_encrypted = true;
      payload.expiry_year_encrypted = true;
    }
  
    // Set headers
    const headers = {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json'
    };
  
    // Make request to Flutterwave API to initiate payment
    const response = await axios.post(endpoint, payload, { headers });
    console.log(response);
  
    // Check if the response status is success
    if (response.data && response.data.status === 'success') {
      const authorization = response.data.meta?.authorization;
      if (authorization && authorization.transfer_reference) {
        // Extract the relevant data
        const { transfer_reference, transfer_account, transfer_bank, account_expiration, transfer_note, transfer_amount, mode } = authorization;
        // Return the response
        return res.status(200).json({ transfer_reference, transfer_account, transfer_bank, account_expiration, transfer_note, transfer_amount, mode });
      } else {
        throw new Error('Unexpected API response: no authorization property found in response meta');
      }
    } else {
      throw new Error('Unexpected API response: status is not success');
    }
  
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data) {
      console.log(error.response.data);
    }
    console.log(error.stack);
    res.status(500).json({ message: 'An error occurred while initiating payment' });
  }
};




// Fetch Static Virtual Accounts
exports.fetchStaticVirtualAccount = async (req, res) => {
  const accountReference = req.params.accountReference;
  const currency = "NGN";

  try {
    // Set the endpoint URL
    const endpoint = `https://api.flutterwave.com/v3/payout-subaccounts/${accountReference}/static-account?currency=${currency}`;

    // Set headers
    const headers = {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json'
    };

    // Make request to Flutterwave API to fetch static virtual account details
    const response = await axios.get(endpoint, { headers });

    // Check if the response status is success
    if (response.data && response.data.status === 'success') {
      const staticAccountData = response.data.data;
      // Return the static virtual account details
      return res.status(200).json(staticAccountData);
    } else {
      throw new Error('Unexpected API response: status is not success');
    }
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data) {
      console.log(error.response.data);
    }
    console.log(error.stack);
    res.status(500).json({ message: 'An error occurred while fetching static virtual account details' });
  }
};




exports.fundAccount = async (req, res) => {
  try {
    const { amount, paymentType, email, tx_ref, ...paymentDetails } = req.body;
    let endpoint;
    
    // Set the endpoint URL based on the payment type
    if (paymentType === 'card') {
      endpoint = 'https://api.flutterwave.com/v3/charges?type=card';
    } else if (paymentType === 'bank_transfer') {
      endpoint = 'https://api.flutterwave.com/v3/charges?type=bank_transfer';
    } else if (paymentType === 'mono') {
      endpoint = 'https://api.flutterwave.com/v3/charges?type=mono';
    } else {
      throw new Error('Invalid payment type');
    }
    
    // Construct request payload
    const payload = {
      amount,
      email,
      tx_ref,
      ...paymentDetails
    };
    
    // Set headers
    const headers = {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json'
    };
    
    // Make request to Flutterwave API to initiate payment
    const response = await axios.post(endpoint, payload, { headers });
    console.log(response.data);
    
    // Check if the response status is success
    if (response.data && response.data.status === 'success') {
      const authorization = response.data.meta?.authorization;
      if (authorization) {
        // Extract the relevant data
        const { auth_model, auth_url } = authorization;
        // Return the response
        return res.status(200).json({ auth_model, auth_url });
      } else {
        throw new Error('Unexpected API response: no authorization property found in response meta');
      }
    } else {
      throw new Error('Unexpected API response: status is not success');
    }
  } catch (error) {
    // Handle the error
    console.error(error);
    res.status(500).json({ message: 'An error occurred while processing the payment' });
  }
};





// exports.fundUserAccount = async (req, res) => {

//   try {
//     const { amount, paymentType, email, tx_ref, ...paymentDetails } = req.body;
//     let endpoint;
    
//     // Set the endpoint URL based on the payment type
//     if (paymentType === 'card') {
//       endpoint = 'https://api.flutterwave.com/v3/charges?type=card';
//     } else if (paymentType === 'bank_transfer') {
//       endpoint = 'https://api.flutterwave.com/v3/charges?type=bank_transfer';
//     } else if (paymentType === 'mono') {
//       endpoint = 'https://api.flutterwave.com/v3/charges?type=mono';
//     } else {
//       throw new Error('Invalid payment type');
//     }
    
//     // Construct request payload
//     const payload = {
//       amount,
//       email,
//       tx_ref,
//       ...paymentDetails
//     };
    
//     // Set headers
//     const headers = {
//       Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
//       'Content-Type': 'application/json'
//     };
    
//     // Make request to Flutterwave API to initiate payment
//     const response = await axios.post(endpoint, payload, { headers });
//     console.log(response.data);
    
//     // Check if the response status is success
//     if (response.data && response.data.status === 'success') {
//       const authorization = response.data.meta?.authorization;
//       if (authorization) {
//         // Extract the relevant data
//         const { auth_model, auth_url } = authorization;
//         // Return the response
//         return res.status(200).json({ auth_model, auth_url });
//       } else {
//         throw new Error('Unexpected API response: no authorization property found in response meta');
//       }
//     } else {
//       throw new Error('Unexpected API response: status is not success');
//     }
//   } catch (error) {
//     // Handle the error
//     console.error(error);
//     res.status(500).json({ message: 'An error occurred while processing the payment' });
//   }
// };


exports.fundUserAccount = async (req, res) => {
  try {
    // Extract user ID from request params
    const userId = req.params.userId;

    // Validate user authorization here (e.g., ensure the user has permission to perform transactions)

    // Extract transaction details from request body
    const { type, amount, description } = req.body;

    // Create a new transaction with user ID
    const transaction = new Transaction({ userId, type, amount, description });
    await transaction.save();

    // Update user balance based on transaction type
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'credit') {
      type = 'credit', // Replace with either 'credit' or 'debit'
      ref = 'Wallet', 
      user.balance += amount;
    } else if (type === 'debit') {
      type = 'dedit', // Replace with either 'credit' or 'debit'
      ref = 'Wallet'; 
      if (user.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance for transaction' });
      }
      user.balance += amount;
      
    }
    await user.save();

    // Return success response
    res.json({ message: 'Transaction created successfully', transaction });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};
