const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/resend-otp/:email', authController.resendOtp);
router.put('/change-password', authMiddleware(), authController.changePassword);
router.get('/users', authMiddleware(['super_admin']), authController.getAllUsers);

module.exports = router;
