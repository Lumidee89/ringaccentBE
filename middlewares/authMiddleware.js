const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'Authorization token is required' });
  }

  try {
    // Verify the token and extract the userId from it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user based on the decoded userId
    const user = await User.findById(decoded.userId).select('-password'); // Exclude password from the user object

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Attach the user object to the request
    req.user = user;

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
