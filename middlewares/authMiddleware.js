const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authorization token is required" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.userId || !decoded.name || !decoded.role) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      req.userId = decoded.userId;
      req.userName = decoded.name;
      req.userRole = decoded.role; 

      if (requiredRoles.length && !requiredRoles.includes(req.userRole)) {
        return res.status(403).json({ message: "You do not have the required permissions" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = authMiddleware;