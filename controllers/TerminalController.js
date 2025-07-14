
const sql = require('../db/connection');

exports.debitCard = async (req, res) => {
    const { cardUid } = req.params; // The unique ID of the MIFARE card
    const { amount } = req.body; // The fare amount to debit

    const debitAmount = parseFloat(amount);
    if (isNaN(debitAmount) || debitAmount <= 0) {
        return res.status(400).json({ error: 'Invalid debit amount.' });
    }

    try {
        const result = await sql.transaction(async (tx) => {
            // 1. Find the card by its UID
            const [card] = await tx`SELECT id, profile_id, card_type, status FROM cards WHERE card_uid = ${cardUid}`;
            if (!card) {
                return { status: 404, error: 'Card not found.' };
            }

            // 2. Ensure it's a RIDER card and is active
            if (card.card_type !== 'MIFARE_RIDER' || card.status !== 'active') {
                return { status: 400, error: 'Invalid card type or card is not active.' };
            }

            // 3. Get the associated RIDER profile's bus balance
            const [busBalanceRecord] = await tx`SELECT balance FROM bus_balances WHERE rider_profile_id = ${card.profile_id}`;
            if (!busBalanceRecord || busBalanceRecord.balance < debitAmount) {
                return { status: 400, error: 'Insufficient balance on card.' };
            }

            // 4. Deduct the amount from the bus balance
            const [updatedBalance] = await tx`
                UPDATE bus_balances
                SET balance = balance - ${debitAmount}
                WHERE rider_profile_id = ${card.profile_id}
                RETURNING balance;
            `;

            // 5. Log the transaction
            await tx`
                INSERT INTO transactions (profile_id, transaction_type, amount, description)
                VALUES (${card.profile_id}, 'FARE_DEBIT', ${debitAmount}, 'Bus fare payment');
            `;

            return { status: 200, data: { newBalance: updatedBalance.balance, message: 'Debit successful.' } };
        });

        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(result.status).json(result.data);

    } catch (error) {
        console.error('Failed to debit card:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.pendingRecharges = async (req, res) => {
    const { cardUid } = req.params; // The unique ID of the MIFARE card

    try {
        // 1. Find the card by its UID
        const [card] = await sql`SELECT id, profile_id, card_type, status FROM cards WHERE card_uid = ${cardUid}`;
        if (!card) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        // 2. Ensure it's a RIDER card
        if (card.card_type !== 'MIFARE_RIDER') {
            return res.status(400).json({ error: 'Invalid card type. Only RIDER cards can have pending recharges.' });
        }

        // 3. Fetch pending recharges for this profile
        // For now, we'll assume any 'TRANSFER_TO_BUS' transaction that hasn't been 'synced' is pending.
        // In a more complex system, you might have a separate 'pending_recharges' table or a flag.
        const pendingTransactions = await sql`
            SELECT id, amount, created_at, description
            FROM transactions
            WHERE profile_id = ${card.profile_id}
            AND transaction_type = 'TRANSFER_TO_BUS'
            AND status = 'completed' -- Assuming 'completed' means it's ready to be applied to the physical card
            ORDER BY created_at ASC;
        `;

        // TODO: In a real system, once a recharge is applied by the terminal, its status should be updated
        // (e.g., to 'applied' or 'synced') to prevent double application.

        res.json(pendingTransactions);

    } catch (error) {
        console.error('Failed to get pending recharges:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// The 'sync' endpoint could be a more general endpoint for terminals to send/receive data.
// For now, it can simply return pending recharges, or be expanded later.
exports.syncTerminal = async (req, res) => {
    // This endpoint could be used for:
    // - Receiving offline transactions from the terminal
    // - Sending configuration updates to the terminal
    // - A general heartbeat/status check

    // For now, let's just return a success message.
    res.status(200).json({ message: 'Terminal sync successful.' });
};
