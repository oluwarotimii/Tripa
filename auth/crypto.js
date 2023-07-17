const crypto = require('crypto');

// Generate a random buffer of 256 bits (32 bytes)
const secretKey = crypto.randomBytes(32);

// Convert the buffer to a base64 URL-safe string
const jwtSecret = secretKey.toString('base64')
  .replace('+', '-')
  .replace('/', '_')
  .replace(/=+$/, '');

console.log('Generated JWT secret key:', jwtSecret);
