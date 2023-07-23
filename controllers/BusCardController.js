
// Import required modules
const mongoose = require('mongoose');
const User = require('../models/userSchema')
const BusCard = require('../models/BusCardSchema'); // Import BusCard model


function generateCardNumber() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber;
}

const randomSixDigitNumber = generateCardNumber();
// console.log(randomSixDigitNumber);




// Function to generate a random card number// Create a new Bus Card
exports.createBusCard = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique card number
    let cardNumber = generateCardNumber();
    let isCardNumberUnique = false;

    // Check if the generated card number is unique
    while (!isCardNumberUnique) {
      const existingCard = await BusCard.findOne({ cardNumber });
      if (!existingCard) {
        isCardNumberUnique = true;
      } else {
        cardNumber = generateCardNumber();
      }
    }

    // Create a new bus card
    const busCard = new BusCard({
      cardNumber,
      isActive: true,
      balance: 0,
      owner: userId,
    });

    // Save the new bus card
    await busCard.save();

    // Add the bus card to the user's busCards array
    user.busCards.push({
      cardNumber: busCard.cardNumber,
      isActive: busCard.isActive,
      balance: busCard.balance,
      cardId: busCard._id,   // store the card ID in the user schema
    });
    await user.save();

    res.json(busCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create bus card' });
  }
};




// Get all Bus Cards
exports.getAllBusCards = async (req, res) => {
  try {
    // Fetch all BusCard objects from the database and include the "cardNumber" field in the projection
    const busCards = await BusCard.find({}, 'cardNumber _id isActive balance owner created_at __v');
    res.json(busCards); // Returning the fetched BusCard objects as response
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to get all Bus Cards' });
  }
};


//get bus card by User

// exports.getBusCards = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const user = await User.findById(userId).populate('busCards');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const busCards = user.busCards;

//     res.status(200).json(busCards);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Failed to fetch bus cards' });
//   }
// };



// Get bus cards by user ID
exports.getBusCards = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the bus cards for the user
    const busCards = await BusCard.find({ owner: userId });

    res.json(busCards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bus cards' });
  }
};





// Update Bus Card by ID
exports.updateBusCardById = async (req, res) => {
  try {
    // ... code for updating Bus Card by ID ...
    // Placeholder code: Replace with actual implementation
    const busCardId = req.params.id; // Example: Extracting BusCard ID from request parameters
    const updatedBusCard = await BusCard.findByIdAndUpdate(busCardId, req.body, { new: true });
    if (!updatedBusCard) {
      return res.status(404).json({ error: 'Bus Card not found' }); 
    }
    res.json(updatedBusCard); // Example: Returning the updated BusCard object as response
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to update Bus Card by ID' });
  }
};


// Delete bus card by ID
exports.deleteBusCardById = async (req, res) => {
  try {
    const busCardId = req.params.id; // Extracting BusCard ID from request parameters

    // Find the bus card by ID
    const busCard = await BusCard.findById(busCardId);

    if (!busCard) {
      return res.status(404).json({ error: 'Bus Card not found' }); // Example: Handling case when BusCard is not found
    }

    // Check if bus card balance is zero
    if (busCard.walletBalance > 0) {
      return res.status(400).json({ error: 'Bus card balance must be zero before deleting' });
    }

    // Delete bus card from database
    await BusCard.findByIdAndDelete(busCardId);

    return res.json({ message: 'Bus card deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete bus card by ID' });
  }
};



// Recharge bus card
exports.rechargeBusCard = async (req, res, next) => {
  const userId = req.params.userId;
  const busCardId = req.params.cardId;
  const amount = req.body.amount;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the bus card exists and belongs to the user
    const busCard = await BusCard.findOne({ _id: busCardId, owner: userId });
    if (!busCard) {
      return res.status(404).json({ message: 'Bus card not found' });
    }

    // Add the amount to the bus card balance
    busCard.balance += amount;

    // Save the changes
    await busCard.save();
    user.save(busCard);

    res.json({ message: 'Bus card recharged successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to recharge the bus card' });
  }
};






// Get bus card balance
exports.getBusCardBalance = async (req, res) => {
  try {
    const cardId = req.params.cardId;

    // Find the bus card by cardId
    const busCard = await BusCard.findById(cardId);

    if (!busCard) {
      return res.status(404).json({ message: 'Bus card not found' });
    }

    return res.status(200).json({ balance: busCard.balance });
  } catch (error) {
    console.error('Error in getting bus card balance:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Initiate transfer from one bus card to another
exports.initiateTransfer = async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const targetCardId = req.body.targetCardId; // Assuming the target cardId is sent in the request body
    const amount = req.body.amount; // Assuming the transfer amount is sent in the request body

    // Find the source bus card by cardId
    const sourceBusCard = await BusCard.findById(cardId);

    if (!sourceBusCard) {
      return res.status(404).json({ message: 'Source bus card not found' });
    }

    // Find the target bus card by targetCardId
    const targetBusCard = await BusCard.findById(targetCardId);

    if (!targetBusCard) {
      return res.status(404).json({ message: 'Target bus card not found' });
    }

    // Perform the transfer
    if (sourceBusCard.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance in source bus card' });
    }

    sourceBusCard.balance -= amount;
    targetBusCard.balance += amount;

    await sourceBusCard.save();
    await targetBusCard.save();

    return res.status(200).json({ message: 'Transfer successful' });
  } catch (error) {
    console.error('Error in initiating transfer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};





// BusCardController.js to cahnge the card status of the card

exports.changeCardStatus = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Check if the user and bus card exist
    const busCard = await BusCard.findOne({ _id: cardId });
    if (!busCard) {
      return res.status(404).json({ error: 'Bus card not found' });
    }

    // Toggle the isActive status
    busCard.isActive = !busCard.isActive;
    await busCard.save();

    // Return success response
    res.json({ message: 'Bus card status updated successfully', busCard });
  } catch (error) {
    // Handle any errors that may occur
    console.error(error);
    res.status(500).json({ error: 'Failed to update bus card status' });
  }
};











