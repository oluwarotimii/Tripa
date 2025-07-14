
const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');
const ProfileController = require('../controllers/profileController');
const WalletController = require('../controllers/WalletController');
const BusCardController = require('../controllers/BusCardController');
const { authenticate } = require('../middlewares/AuthMiddleware');

// User Authentication
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);

// Profile Management (Protected Routes)
router.post('/profiles', authenticate, ProfileController.createProfile);
router.get('/profiles', authenticate, ProfileController.listProfiles);

// Wallet & Funds Management (Protected Routes)
router.get('/wallets/rider/:profileId/bus-balance', authenticate, WalletController.getBusBalance);
router.post('/wallets/rider/:profileId/transfer-to-bus', authenticate, WalletController.transferToBusBalance);

// Card Management (Protected Routes)
router.post('/profiles/:profileId/cards', authenticate, BusCardController.createCard);
router.get('/profiles/:profileId/cards', authenticate, BusCardController.listCardsForProfile);


// Wallet & Funds Management (Protected Routes)
router.get('/wallets/:profileId/transactions', authenticate, WalletController.getTransactionsForProfile);


// Terminal Routes (Protected)
router.post('/terminals/:cardUid/debit', authenticate, TerminalController.debitCard);
router.get('/terminals/:cardUid/pending-recharges', authenticate, TerminalController.pendingRecharges);
router.post('/terminals/sync', authenticate, TerminalController.syncTerminal);

// You can add other routes here as we continue to build the application

module.exports = router;
