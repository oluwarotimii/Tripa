// authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware function to authenticate user
const authenticate = (req, res, next) => {
  try {
    // Get token from request headers, query params, or cookies
    const token = req.headers.authorization || req.query.token || req.cookies.token;

    // If token not found, return an error response
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not found' });
    }

    // Verify and decode token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // If token verification fails, return an error response
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      // Attach the decoded user information to the request object
      req.user = decoded.user;

      // Call the next middleware or route handler
      next();
    });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { authenticate };