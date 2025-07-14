
const sql = require('../db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

exports.register = async (req, res) => {
    const {
        fullName,
        email,
        password,
        phoneNumber,
        profileType = 'RIDER' // Default to RIDER if not specified
    } = req.body;

    if (!fullName || !email || !password || !phoneNumber) {
        return res.status(400).json({
            error: 'Missing required fields: fullName, email, password, and phoneNumber are required.'
        });
    }

    try {
        const result = await sql.transaction(async (tx) => {
            // 1. Check if user with the same email already exists
            const existingUser = await tx`SELECT * FROM users WHERE email = ${email}`;
            if (existingUser.length > 0) {
                // By returning a value, we can handle the response outside the transaction
                return {
                    status: 409,
                    error: 'Email already in use'
                };
            }

            // 2. Hash the password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // This is a placeholder for the sudo_customer_id. 
            // In a real implementation, you would get this from your payment provider.
            const sudoCustomerId = `CUST_${Date.now()}`;

            // 3. Create the user
            const [user] = await tx`
                INSERT INTO users (full_name, email, password_hash, phone_number, sudo_customer_id)
                VALUES (${fullName}, ${email}, ${passwordHash}, ${phoneNumber}, ${sudoCustomerId})
                RETURNING id, full_name, email, phone_number, created_at;
            `;

            // 4. Create a Flutterwave subaccount for the new profile
            const accountReference = generateAccountReference();
            const flutterwaveData = {
                account_name: fullName,
                email,
                mobilenumber: phoneNumber,
                country: "NG", // Assuming Nigeria, this should be dynamic in a real app
                account_reference: accountReference
            };
            const headers = {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
            };

            const flutterwaveResponse = await axios.post('https://api.flutterwave.com/v3/payout-subaccounts', flutterwaveData, {
                headers
            });
            const subaccount = flutterwaveResponse.data.data;

            if (!subaccount || !subaccount.subaccount_id) {
                // This will cause the transaction to rollback
                throw new Error('Failed to create Flutterwave subaccount.');
            }

            // 5. Create the user's profile
            const [profile] = await tx`
                INSERT INTO profiles (user_id, profile_type, sudo_account_id, status)
                VALUES (${user.id}, ${profileType}, ${subaccount.subaccount_id}, 'active')
                RETURNING id, profile_type, status;
            `;

            return {
                status: 201,
                data: {
                    message: 'User registered successfully',
                    user,
                    profile
                }
            };
        });

        // Handle the response based on the transaction result
        if (result.error) {
            return res.status(result.status).json({
                error: result.error
            });
        }
        return res.status(result.status).json(result.data);

    } catch (error) {
        console.error('Registration failed:', error.message);
        res.status(500).json({
            error: 'Failed to register user'
        });
    }
};

exports.login = async (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required.'
        });
    }

    try {
        // 1. Find the user in the database
        const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // 2. Compare the entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // 3. Fetch user's profiles
        const profiles = await sql`SELECT id, profile_type, status FROM profiles WHERE user_id = ${user.id}`;

        // 4. Generate a JWT token
        const token = jwt.sign({
            userId: user.id
        }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // 5. Return the user data, profiles, and token
        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
            },
            profiles,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to login'
        });
    }
};
