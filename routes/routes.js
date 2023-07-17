// Import required modules
const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController')
const BusCardController = require('../controllers/BusCardController');
const WalletController = require('../controllers/WalletController');
// const merchantController = require('../merchant/merchantController');

// User Routes
router.post('/register', UserController.register); 
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.forgotPassword);
router.put('/users/:userId', UserController.editUserName);
router.get('/users', UserController.getAllUsers);
router.get('/users/:userId/details', UserController.getUserDetails);
router.put('/users/:userId/balance', UserController.updateUserBalance);
router.get('/users/:userId/transactions', UserController.getUserTransactions);
router.put('/users/:userId/credit', UserController.creditUser);
// router.put('/users/:userId/bus-cards/:busCardId/recharge', UserController.rechargeBusCard);
// Route to create a bus card and recharge from wallet
// router.post('/bus-cards',  BusCardController.createBusCard);

//MERCHANT ROUTES



// router.post('/register', merchantController.register);
// router.post('/login', merchantController.login);
// router.post('/forgot-password', merchantController.forgotPassword);
// router.put('/merchants/:merchantId', merchantController.editMerchantName);
// router.get('/merchants', merchantController.getAllMerchants);
// router.get('/merchants/:merchantId/details', merchantController.getMerchantDetails);
// router.put('/merchants/:merchantId/balance', merchantController.updateMerchantBalance);
// router.get('/merchants/:merchantId/transactions', merchantController.getMerchantTransactions);
// router.put('/:merchantId/credit', merchantController.creditMerchant);




// Bus Card Routes 
router.get('/users/:userId/buscards', BusCardController.getBusCards);
router.post('/users/:userId/buscards', BusCardController.createBusCard);
router.put('/users/:userId/buscards/:cardId/recharge', BusCardController.rechargeBusCard);
router.put('/users/userId/buscards/:cardId/deactivate', BusCardController.deactivateBusCardById);
router.delete('/buscards/:cardId', BusCardController.deleteBusCardById);
router.get('/buscards/:cardId/balance', BusCardController.getBusCardBalance);
router.put('/buscards/:cardId/activate', BusCardController.activateBusCardById);
router.post('/users/userId/buscards/:cardId/transfer', BusCardController.initiateTransfer);
router.get('/buscards', BusCardController.getAllBusCards);

// Wallet Routes
router.post('/users/:userId/wallets', WalletController.createWallet);
router.get('/wallets/:walletId/balance', WalletController.getWalletBalance);
router.post('/wallets/:walletId/transactions', WalletController.createTransaction);
router.get('/wallets/:walletId/transactions', WalletController.getTransactionHistory);
router.get('/wallets/:walletId/transactions/:transactionId', WalletController.getTransactionDetails);
router.get('/users/wallet', WalletController.getAllWallets);
router.get('/users/:userId/wallets', WalletController.getUserWallets);
router.get('/wallets/:walletId/balance', WalletController.getWalletBalance);
router.put('/wallets/:walletId/balance', WalletController.setWalletBalance);
router.get('/wallets/save-all', WalletController.saveAllWallets);

// Additional Routes
router.post('/wallets/:walletId/add-funds', WalletController.addFundsToWallet);
router.post('/fundVirtualAccount', WalletController.fundVirtualAccount);
router.get('/payout-subaccounts/:accountReference/static-account', WalletController.fetchStaticVirtualAccount);

module.exports = router;
