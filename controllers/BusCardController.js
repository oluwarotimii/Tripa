const sql = require('../db/connection');

// In a real-world scenario, this should be a more robust, cryptographically secure random string.
const generateCardUID = () => {
    return `MIFARE_${Date.now()}`;
};

exports.createCard = async (req, res) => {
    const { userId } = req; // Injected by authenticate middleware
    const { profileId } = req.params;
    const { cardType } = req.body; // e.g., 'MIFARE_RIDER' or 'MIFARE_MERCHANT'

    // Validate cardType
    if (!cardType || (cardType !== 'MIFARE_RIDER' && cardType !== 'MIFARE_MERCHANT')) {
        return res.status(400).json({ error: 'Invalid cardType. Must be MIFARE_RIDER or MIFARE_MERCHANT.' });
    }

    try {
        const result = await sql.transaction(async (tx) => {
            // 1. Verify the user owns the profile
            const [profile] = await tx`SELECT id, profile_type FROM profiles WHERE id = ${profileId} AND user_id = ${userId}`;
            if (!profile) {
                return { status: 403, error: 'Forbidden: You do not own this profile.' };
            }

            // 2. Check that the card type matches the profile type
            if ((profile.profile_type === 'RIDER' && cardType !== 'MIFARE_RIDER') ||
                (profile.profile_type === 'MERCHANT' && cardType !== 'MIFARE_MERCHANT')) {
                return { status: 400, error: `Cannot create a ${cardType} card for a ${profile.profile_type} profile.` };
            }

            // 3. Generate a unique card UID
            const cardUid = generateCardUID();

            // 4. Create the card
            const [newCard] = await tx`
                INSERT INTO cards (profile_id, card_type, card_uid, status)
                VALUES (${profileId}, ${cardType}, ${cardUid}, 'active')
                RETURNING id, card_type, card_uid, status, created_at;
            `;

            return { status: 201, data: newCard };
        });

        if (result.error) {
            return res.status(result.status).json({ error: result.error });
        }
        return res.status(result.status).json(result.data);

    } catch (error) {
        console.error('Failed to create card:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.listCardsForProfile = async (req, res) => {
    const { userId } = req; // Injected by authenticate middleware
    const { profileId } = req.params;

    try {
        // 1. Verify the user owns the profile
        const [profile] = await sql`SELECT id FROM profiles WHERE id = ${profileId} AND user_id = ${userId}`;
        if (!profile) {
            return res.status(403).json({ error: 'Forbidden: You do not own this profile.' });
        }

        // 2. Fetch all cards associated with the profile
        const cards = await sql`
            SELECT id, card_type, card_uid, status, created_at 
            FROM cards 
            WHERE profile_id = ${profileId}
        `;

        res.json(cards);

    } catch (error) {
        console.error('Failed to list cards:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};