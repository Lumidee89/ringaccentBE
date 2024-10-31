const jwt = require('jsonwebtoken');
const config = require('../config/config');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] || req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    const tokenString = token.split(' ')[1] || token; 

    jwt.verify(tokenString, config.jwt.secret || process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token.' });
        }

        if (decoded.userId) {
            req.userId = decoded.userId;
        }
        if (decoded.adminId) {
            req.adminId = decoded.adminId;
        }

        next();
    });
};

module.exports = verifyToken;
