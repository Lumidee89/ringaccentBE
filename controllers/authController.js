const User = require('../models/User');
const generateOtp = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Create new user with OTP
    user = new User({ fullName, email, password });
    user.otp = generateOtp();  // Generate OTP
    user.otpCreatedAt = new Date();  // Store OTP generation time

    await user.save();  // Save user with OTP and timestamp

    // Send OTP to email
    await sendEmail(user.email, 'OTP Verification', `Your OTP is ${user.otp}`);

    res.status(200).json({ msg: 'Registration successful, OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};


// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Optionally check if the OTP has expired
    const otpExpiryDuration = 15 * 60 * 1000;  // OTP valid for 15 minutes
    const currentTime = Date.now();

    if (currentTime - new Date(user.otpCreatedAt).getTime() > otpExpiryDuration) {
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    user.isVerified = true;  // Mark user as verified
    user.otp = undefined;  // Clear OTP after verification
    user.otpCreatedAt = undefined;  // Clear OTP creation time
    await user.save();

    res.status(200).json({ msg: 'OTP verified, account activated' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};


// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  
      if (!user.isVerified) return res.status(400).json({ msg: 'Account not verified' });
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.status(200).json({
        token,
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ msg: 'Server error' });
    }
  };
