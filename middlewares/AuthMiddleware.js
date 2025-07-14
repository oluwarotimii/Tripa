
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

// Middleware function to authenticate user
const authenticate = (req, res, next) => {
  try {
    // Get token from request headers (Authorization: Bearer TOKEN)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Token not found or malformed' });
    }

    const token = authHeader.split(' ')[1];

    // Verify and decode token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // If token verification fails, return an error response
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      // Attach the decoded user ID to the request object
      req.userId = decoded.userId;

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
