
const sql = require('../db/connection');

exports.getBusBalance = async (req, res) => {
    const { userId } = req; // Injected by authenticate middleware
    const { profileId } = req.params;

    try {
        // 1. Verify the user owns this profile
        const [profile] = await sql`SELECT id, profile_type FROM profiles WHERE id = ${profileId} AND user_id = ${userId}`;
        if (!profile) {
            return res.status(403).json({ error: 'Forbidden: You do not own this profile.' });
        }

        // 2. Ensure it's a RIDER profile
        if (profile.profile_type !== 'RIDER') {
            return res.status(400).json({ error: 'Bad Request: Bus balances are only available for RIDER profiles.' });
        }

        // 3. Get the bus balance
        const [busBalance] = await sql`
            SELECT balance, updated_at FROM bus_balances WHERE rider_profile_id = ${profileId}
        `;

        // If no balance record exists, it means they have a balance of 0
        if (!busBalance) {
            return res.json({ balance: '0.00', updated_at: null });
        }

        res.json(busBalance);

    } catch (error) {
        console.error('Failed to get bus balance:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.transferToBusBalance = async (req, res) => {
    const { userId } = req;
    const { profileId } = req.params;
    const { amount } = req.body;

    // Basic validation
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ error: 'Invalid amount specified.' });
    }

    try {
        const result = await sql.transaction(async (tx) => {
            // 1. Verify the user owns the profile and it is a RIDER profile
            const [profile] = await tx`SELECT id, profile_type, sudo_account_id FROM profiles WHERE id = ${profileId} AND user_id = ${userId}`;
            if (!profile) {
                return { status: 403, error: 'Forbidden: You do not own this profile.' };
            }
            if (profile.profile_type !== 'RIDER') {
                return { status: 400, error: 'Bad Request: Transfers can only be made to RIDER profiles.' };
            }

            // 2. TODO: Check Flutterwave subaccount balance
            // For now, we will assume the user has sufficient funds in their main wallet.
            // In a real implementation, you would call the Flutterwave API here to verify the balance.

            // 3. Upsert the bus balance
            const [newBalance] = await tx`
                INSERT INTO bus_balances (rider_profile_id, balance)
                VALUES (${profileId}, ${transferAmount})
                ON CONFLICT (rider_profile_id)
                DO UPDATE SET balance = bus_balances.balance + ${transferAmount}
                RETURNING balance;
            `;

            // 4. Create a transaction record for auditing purposes
            await tx`
                INSERT INTO transactions (profile_id, transaction_type, amount, description)
                VALUES (${profileId}, 'TRANSFER_TO_BUS', ${transferAmount}, 'Funds transferred to bus balance');
            `;

            return { status: 200, data: { newBalance: newBalance.balance, message: 'Transfer successful' } };
        });

        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(result.status).json(result.data);

    } catch (error) {
        console.error('Transfer to bus balance failed:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTransactionsForProfile = async (req, res) => {
    const { userId } = req; // Injected by authenticate middleware
    const { profileId } = req.params;

    try {
        // 1. Verify the user owns this profile
        const [profile] = await sql`SELECT id FROM profiles WHERE id = ${profileId} AND user_id = ${userId}`;
        if (!profile) {
            return res.status(403).json({ error: 'Forbidden: You do not own this profile.' });
        }

        // 2. Fetch transactions for the profile, ordered by creation date
        const transactions = await sql`
            SELECT id, transaction_type, amount, status, reference, description, created_at 
            FROM transactions 
            WHERE profile_id = ${profileId}
            ORDER BY created_at DESC;
        `;

        res.json(transactions);

    } catch (error) {
        console.error('Failed to get transactions for profile:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
