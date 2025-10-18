const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// existing routes: signup, login, etc.
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// NEW:
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
