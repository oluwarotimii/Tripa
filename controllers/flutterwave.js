const axios = require('axios');
require('dotenv').config();


// Set your Flutterwave secret key
const secretKey = process.env.FLW_SECRET_KEY;

// Create wallet function
exports.NewWallet = async (req, res) => {
  // Get data from request body
  const { account_name, email, mobilenumber, country } = req.body;

  try {
    const response = await axios.post('https://api.flutterwave.com/v3/payout-subaccounts', {
      account_name,
      email,
      mobilenumber,
      country
    }, {
      headers: {
        Authorization: `Bearer ${secretKey}`
      }
    });

    // Return success response
    res.status(200).json(response.data);
  } catch (error) {
    // Return error response
    res.status(error.response.status).json(error.response.data);
  }
};
