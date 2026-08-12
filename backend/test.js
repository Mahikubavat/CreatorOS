require('dotenv').config();
const connectDB = require('./config/db');
const { User, Content, Task, TimeBlock, Transaction, Sponsorship } = require('./models');

const testDatabase = async () => {
  try {
    await connectDB();
    
    // Check if models were registered successfully by counting documents
    const userCount = await User.countDocuments();
    console.log(`Success! Models loaded properly. Total users in DB: ${userCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Model or DB Test Failed:', error.message);
    process.exit(1);
  }
};

testDatabase();