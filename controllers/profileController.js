
const sql = require('../db/connection');
const axios = require('axios');

// This is a placeholder. In a real app, you would have a more robust way 
// to generate unique references, perhaps involving the database sequence or a UUID.
const generateAccountReference = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 20;
  let accountReference = 'PSA';

  while (accountReference.length < length) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    accountReference += characters[randomIndex];
  }

  return accountReference;
};

exports.createProfile = async (req, res) => {
    const { userId } = req; // Injected by the authenticate middleware
    const { profileType } = req.body; // e.g., 'MERCHANT'

    if (!profileType || (profileType !== 'RIDER' && profileType !== 'MERCHANT')) {
        return res.status(400).json({ error: 'Invalid profileType. Must be RIDER or MERCHANT.' });
    }

    try {
        const result = await sql.transaction(async (tx) => {
            // 1. Check if the user already has a profile of this type
            const existingProfile = await tx`SELECT * FROM profiles WHERE user_id = ${userId} AND profile_type = ${profileType}`;
            if (existingProfile.length > 0) {
                return { status: 409, error: `User already has a ${profileType} profile.` };
            }

            // 2. Get user details for Flutterwave
            const [user] = await tx`SELECT full_name, email, phone_number FROM users WHERE id = ${userId}`;
            if (!user) {
                // This should not happen if the auth middleware is working correctly
                return { status: 404, error: 'User not found.' };
            }

            // 3. Create a new Flutterwave subaccount
            const accountReference = generateAccountReference();
            const flutterwaveData = {
                account_name: user.full_name,
                email: user.email,
                mobilenumber: user.phone_number,
                country: "NG",
                account_reference: accountReference
            };
            const headers = { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` };

            const flutterwaveResponse = await axios.post('https://api.flutterwave.com/v3/payout-subaccounts', flutterwaveData, { headers });
            const subaccount = flutterwaveResponse.data.data;

            if (!subaccount || !subaccount.subaccount_id) {
                throw new Error('Failed to create Flutterwave subaccount.');
            }

            // 4. Create the new profile
            const [newProfile] = await tx`
                INSERT INTO profiles (user_id, profile_type, sudo_account_id, status)
                VALUES (${userId}, ${profileType}, ${subaccount.subaccount_id}, 'active')
                RETURNING id, profile_type, status;
            `;

            return { status: 201, data: newProfile };
        });

        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(result.status).json(result.data);

    } catch (error) {
        console.error('Failed to create profile:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.listProfiles = async (req, res) => {
    const { userId } = req; // Injected by the authenticate middleware

    try {
        const profiles = await sql`SELECT id, profile_type, status FROM profiles WHERE user_id = ${userId}`;
        res.json(profiles);
    } catch (error) {
        console.error('Failed to list profiles:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
