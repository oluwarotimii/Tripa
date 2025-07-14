
const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');
const ProfileController = require('../controllers/profileController');
const { authenticate } = require('../middlewares/AuthMiddleware');

// User Authentication
router.post('/auth/register', UserController.register);
router.post('/auth/login', UserController.login);

// Profile Management (Protected Routes)
router.post('/profiles', authenticate, ProfileController.createProfile);
router.get('/profiles', authenticate, ProfileController.listProfiles);


// You can add other routes here as we continue to build the application

module.exports = router;
