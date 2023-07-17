const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO


const connectDB = async () => {
  try {
     await mongoose.connect(MONGO_URI,  {
      serverSelectionTimeoutMS: 300000, // Increased timeout to 30 seconds
    });
    console.log('MongoDB connected successfully..... GOD IS THE GREATEST!!!!!!');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
};

module.exports = connectDB;

// m
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((err) => {
//     console.error('Failed to connect to MongoDB:', err);
//   });


