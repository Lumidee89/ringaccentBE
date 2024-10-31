const mongoose = require('mongoose');
const config = require('./config'); 

const connectDB = async () => {
  try {
    await mongoose.connect(config.db.uri)
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
