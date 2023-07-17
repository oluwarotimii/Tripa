const User = require('./models/userSchema');
const BusCard = require('./models/BusCardSchema');

async function updateExistingUsers() {
  try {
    // Find all existing users
    const users = await User.find();

    // Iterate through each user
    for (const user of users) {
      // Check if the user already has bus cards
      if (user.busCards && user.busCards.length > 0) {
        continue; // Skip if bus cards already exist
      }

      // Create bus card for the user
      const busCard = new BusCard({
        cardNumber: generateCardNumber(),
        isActive: true,
        balance: 0,
        created_at: new Date(),
      });

      // Add the bus card to the user's busCards array
      user.busCards.push(busCard);

      // Save the user with updated bus card details
      await user.save();
    }

    console.log('Existing users updated successfully');
  } catch (error) {
    console.error('Failed to update existing users:', error);
  }
}

updateExistingUsers();
