// // WalletController.js

// // Import required modules
// const axios = require('axios');

// const Wallet = require('../models/walletSchema');
// const Transaction = require('../models/transactionSchema');
// const User = require('../models/userSchema'); 
// // const FlwWallet = require('./flutterwave')
// require('dotenv').config();
// // const AuthMiddleware = require('../middlewares/AuthMiddleware');
// const forge = require("node-forge");
// const encryptionKey = process.env.FLW_ENCRYPTION_KEY;


// // exports.createWallet = async (req, res) => {
// //   try {
// //     const { account_name, email, mobilenumber, country } = req.body;
// //     const headers = {
// //       Authorization: process.env.FLW_SECRET_KEY // Replace with your actual secret key
// //     };
// //     const data = {
// //       account_name: User.name,
// //        email,
// //       mobilenumber,
// //       country,

// //     };
// //     const response = await axios.post('https://api.flutterwave.com/v3/payout-subaccounts', data, { headers });
// //     console.log(response.data);
// //     // Handle success response here
// //     res.status(200).json(response.data);
// //   } catch (error) {
// //     console.error(error);
// //     // Handle error response here
// //     res.status(500).json({ status: 'error', message: error.message, data: null });
// //   }
// // };

// // 645eab39432b1a9f13ac8ae2


// exports.createWallet = async (req, res) => {
//   try {
//     const { email, mobilenumber, country } = req.body;
//     const user = await User.findById(req.userId);

//     const headers = {
//       Authorization: process.env.FLW_SECRET_KEY // Replace with your actual secret key
//     };

//     const data = {
//       account_name: User.name,
//       email,
//       mobilenumber,
//       country
//     };

//     const response = await axios.post('https://api.flutterwave.com/v3/payout-subaccounts', data, { headers });
//     console.log(response.data);

//     // Save accountNumber to the database here
//     user.wallet = response.data.data.account_number;
//     await user.save();

//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error(error);
//     // Handle error response here
//     res.status(500).json({ status: 'error', message: error.message, data: null });
//   }
// };



// //getNUBAN
// exports.getNubanDetails = async (req,res) => {}

// //get all wallets

// exports.getUserWallets = async (req, res) => {
//   try {
//     const headers = {
//       Authorization: process.env.FLW_SECRET_KEY // Replace with your actual secret key
//     };
    
//     const response = await axios.get('https://api.flutterwave.com/v3/payout-subaccounts', { headers });
//     // Handle success response here
//     res.status(200).json({ status: 'success', message: 'Wallets retrieved successfully', data: response.data });
//   } catch (error) {
//     console.error(error);
//     // Handle error response here
//     res.status(500).json({ status: 'error', message: error.message, data: null });
//   }
// };


// // Get Wallet Balance

// // Define the getWalletBalance function
// exports.getWalletBalance = async (req, res) => {
//   const walletId = req.params.walletId;

//   try {
//     const headers = {
//       Authorization: process.env.FLW_SECRET_KEY // Replace with your actual secret key
//     };
    
//     const response = await axios.get(`https://api.flutterwave.com/v3/wallets/PSA3B6F877C205106910/balance`, { headers });
    
//     // Parse the response data
//     const balanceData = response.data;
    
//     // Extract the relevant data
//     const balance = balanceData.data && balanceData.data.length > 0 ? balanceData.data[0].balance : null;
    
//     // Handle success response here
//     if (balance !== null) {
//       return res.status(200).json({ status: 'success', message: 'Balance retrieved successfully', data: balance });
//     } else {
//       return res.status(500).json({ status: 'error', message: 'No balance data found', data: null });
//     }
//   } catch (error) {
//     console.error(error);
//     // Handle error response here
//     return res.status(500).json({ status: 'error', message: error.message, data: null });
//   }
// };




// // Create Transaction
// exports.createTransaction = async (req, res) => {
//   try {
//     // Extract wallet ID from request params
//     const walletId = req.params.walletId;

//     // Authenticate user using middleware
//     // await AuthMiddleware.authenticate(req, res);

//     // Find the wallet in the database
//     const wallet = await Wallet.findById(walletId);

//     // Check if wallet exists
//     if (!wallet) {
//       return res.status(404).json({ error: 'Wallet not found' });
//     }

//     // Extract transaction details from request body
//     const { type, amount, description } = req.body;

//     // Create a new transaction for the wallet
//     const transaction = new Transaction({ walletId, type, amount, description });
//     await transaction.save();

//     // Update wallet balance based on transaction type
//     if (type === 'credit') {
//       wallet.balance += amount;
//     } else if (type === 'debit') {
//       if (wallet.balance < amount) {
//         return res.status(400).json({ error: 'Insufficient balance for transaction' });
//       }
//       wallet.balance -= amount;
//     }
//     await wallet.save();

//     // Return success response
//     res.json({ message: 'Transaction created successfully', transaction });
//   } catch (error) {
//     // Handle any errors that may occur
//     console.error(error);
//     res.status(500).json({ error: 'Failed to create transaction' });
//   }
// };

// // Get Transaction History
// exports.getTransactionHistory = async (req, res) => {
//   try {
//     // Extract wallet ID from request params
//     const walletId = req.params.walletId;

//     // Authenticate user using middleware
//     await AuthMiddleware.authenticate(req, res);

//     // Find the wallet in the database
//     const wallet = await Wallet.findById(walletId);

//     // Check if wallet exists
//     if (!wallet) {
//       return res.status(404).json({ error: 'Wallet not found' });
//     }

//     // Find all transactions for the wallet
//     const transactions = await Transaction.find({ walletId });

//     // Return the transaction history
//     res.json({ transactions });
//   } catch (error) {
//     // Handle any errors that may occur
//     console.error(error);
//     res.status(500).json({ error: 'Failed to get transaction history' });
//   }
// };


// // Get Transaction Details
// exports.getTransactionDetails = async (req, res) => {
//   try {
//     // Extract wallet ID and transaction ID from request params
//     const walletId = req.params.walletId;
//     const transactionId = req.params.transactionId;
    
//     // Find the wallet in the database
//     const wallet = await Wallet.findById(walletId);

//     // Check if wallet exists
//     if (!wallet) {
//       return res.status(404).json({ error: 'Wallet not found' });
//     }

//     // Find the transaction in the database
//     const transaction = await Transaction.findById(transactionId);

//     // Check if transaction exists
//     if (!transaction) {
//       return res.status(404).json({ error: 'Transaction not found' });
//     }

//     // Check if the transaction belongs to the wallet
//     if (transaction.walletId.toString() !== walletId.toString()) {
//       return res.status(403).json({ error: 'Transaction does not belong to wallet' });
//     }

//     // Return the transaction details
//     res.status(200).json({ transaction });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while retrieving transaction details' });
//   }
// };



// //ENCRYPTION
// exports.fundVirtualAccount = async (req, res) => {
//   try {
//     const { amount, currency, paymentType, email, bankTransferCode, card } = req.body;
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
//     let payload = {
//       account_bank: 232,
//       account_number: 6222057760, // Replace with your actual virtual account number
//       amount,
//       currency,
//       email,
//       fullname: paymentType === 'card' ? card?.name : null,
//       tx_ref: `V${Date.now()}`, // Generate a unique transaction reference
//       redirect_url: `${process.env.BASE_URL}/fund-virtual-account/callback`,
//       payment_type: paymentType // card or bank transfer
//     };
  
//     // Encrypt the card details if payment type is card
//     if (paymentType === 'card' && card) {
//       payload = encryptPayloadFields(payload, process.env.FLW_ENCRYPTION_KEY);
//       payload.card_no_encrypted = true;
//       payload.cvv_encrypted = true;
//       payload.expiry_month_encrypted = true;
//       payload.expiry_year_encrypted = true;
//     }
  
//     // Set headers
//     const headers = {
//       Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
//       'Content-Type': 'application/json'
//     };
  
//     // Make request to Flutterwave API to initiate payment
//     const response = await axios.post(endpoint, payload, { headers });
//     console.log(response.data);
  
//     // Extract the authorization details from the response
//     const { transfer_reference, transfer_account, transfer_bank, account_expiration, transfer_note, transfer_amount, mode } = response.data.meta.authorization;
  
//     // Use the authorization details to complete the payment
//     // ...
  
//   } catch (error) {
//     console.error(error);
//     if (error.response && error.response.data) {
//       console.log(error.response.data);
//     }
//     console.log(error.stack);
//     res.status(500).json({ message: 'An error occurred while initiating payment' });
//   }
  
//   // try {
//   //   const { amount, currency, paymentType, email, bankTransferCode, card } = req.body;
//   //   let endpoint;
  
//   //   // Set the endpoint URL based on the payment type
//   //   if (paymentType === 'card') {
//   //     endpoint = 'https://api.flutterwave.com/v3/charges?type=card';
//   //   } else if (paymentType === 'bank_transfer') {
//   //     endpoint = 'https://api.flutterwave.com/v3/charges?type=bank_transfer';
//   //   } else if (paymentType === 'mono') {
//   //     endpoint = 'https://api.flutterwave.com/v3/charges?type=mono';
//   //   } else {
//   //     throw new Error('Invalid payment type');
//   //   }
  
//   //   // Construct request payload
//   //   let payload = {
//   //     account_bank: 232,
//   //     account_number: 6222057657, // Replace with your actual virtual account number
//   //     amount,
//   //     currency,
//   //     email,
//   //     fullname: paymentType === 'card' ? card?.name : null,
//   //     tx_ref: `V${Date.now()}`, // Generate a unique transaction reference
//   //     redirect_url: `${process.env.BASE_URL}/fund-virtual-account/callback`,
//   //     payment_type: paymentType // card or bank transfer
//   //   };
  
//   //   // Encrypt the card details if payment type is card
//   //   if (paymentType === 'card' && card) {
//   //     payload = encryptPayloadFields(payload, process.env.FLW_ENCRYPTION_KEY);
//   //     payload.card_no_encrypted = true;
//   //     payload.cvv_encrypted = true;
//   //     payload.expiry_month_encrypted = true;
//   //     payload.expiry_year_encrypted = true;
//   //   }
  
//   //   // Set headers
//   //   const headers = {
//   //     Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
//   //     'Content-Type': 'application/json'
//   //   };
  
//   //   // Make request to Flutterwave API to initiate payment
//   //   const response = await axios.post(endpoint, payload, { headers });
//   //   console.log(response);
  
//   //   // Check if the response status is success
//   //   if (response.data && response.data.status === 'success') {
//   //     const authorization = response.data.meta?.authorization;
//   //     if (authorization && authorization.transfer_reference) {
//   //       // Extract the relevant data
//   //       const { transfer_reference, transfer_account, transfer_bank, account_expiration, transfer_note, transfer_amount, mode } = authorization;
//   //       // Return the response
//   //       return res.status(200).json({ transfer_reference, transfer_account, transfer_bank, account_expiration, transfer_note, transfer_amount, mode });
//   //     } else {
//   //       throw new Error('Unexpected API response: no authorization property found in response meta');
//   //     }
//   //   } else {
//   //     throw new Error('Unexpected API response: status is not success');
//   //   }
  
//   // } catch (error) {
//   //   console.error(error);
//   //   if (error.response && error.response.data) {
//   //     console.log(error.response.data);
//   //   }
//   //   console.log(error.stack);
//   //   res.status(500).json({ message: 'An error occurred while initiating payment' });
//   // }
  
// //   try {
// //     const { amount, currency, paymentType, email, bankTransferCode, card } = req.body;
// //     let endpoint;

// //     // Set the endpoint URL based on the payment type
// //     if (paymentType === 'card') {
// //       endpoint = 'https://api.flutterwave.com/v3/charges?type=card';
// //     } else if (paymentType === 'bank_transfer') {
// //       endpoint = 'https://api.flutterwave.com/v3/charges?type=bank_transfer';
// //     } else if (paymentType === 'mono') {
// //       endpoint = 'https://api.flutterwave.com/v3/charges?type=mono';
// //     } else {
// //       throw new Error('Invalid payment type');
// //     }

// //     // Construct request payload
// //     let payload = {
// //       account_bank: 232,
// //       account_number: 6222057657, // Replace with your actual virtual account number
// //       amount,
// //       currency,
// //       email,
// //       fullname: paymentType === 'card' ? card?.name : null,
// //       tx_ref: `V${Date.now()}`, // Generate a unique transaction reference
// //       redirect_url: `${process.env.BASE_URL}/fund-virtual-account/callback`,
// //       payment_type: paymentType // card or bank transfer
// //     };

// //     // Encrypt the card details if payment type is card
// //     if (paymentType === 'card' && card) {
// //       payload = encryptPayloadFields(payload, process.env.FLW_ENCRYPTION_KEY);
// //       payload.card_no_encrypted = true;
// //       payload.cvv_encrypted = true;
// //       payload.expiry_month_encrypted = true;
// //       payload.expiry_year_encrypted = true;
// //     }

// //     // Set headers
// //     const headers = {
// //       Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
// //       'Content-Type': 'application/json'
// //     };

// //     // Make request to Flutterwave API to initiate payment
// //     const response = await axios.post(endpoint, payload, { headers });
// //     console.log(response);

// //     // Check if the link property exists in the response data
// //     if (!response.data || !response.data.data || !response.data.data.link) {
// //       throw new Error('Unexpected API response: no link property found in response data');
// //     }

// //     // Extract the relevant data
// //     const { link } = response.data.data;

// //     // Redirect user to payment page
// //     res.redirect(link);
// //   }  catch (error) {
// //     console.error(error);
// //     if (error.response && error.response.data) {
// //       console.log(error.response.data);
// //     }
// //     console.log(error.stack);
// //     res.status(500).json({ message: 'An error occurred while initiating payment' });
// //   }
// };

// exports.getPayoutSubaccountBalance = async (req, res) => {
//   const accountReference = req.params.account_reference;
//   const currency = req.query.currency || 'NGN';

//   try {
//     const headers = {
//       Authorization: process.env.FLW_SECRET_KEY
//     };

//     const response = await axios.get(`https://api.flutterwave.com/v3/payout-subaccounts/${accountReference}/balances?currency=${currency}`, { headers });
//     const balanceData = response.data;

//     if (balanceData.status === 'success') {
//       const balance = balanceData.data && balanceData.data.length > 0 ? balanceData.data[0].available_balance : null;
//       return res.status(200).json({ status: 'success', message: 'Balance retrieved successfully', data: balance });
//     } else {
//       return res.status(500).json({ status: 'error', message: balanceData.message || 'Failed to retrieve balance', data: null });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ status: 'error', message: error.message, data: null });
//   }
// };


