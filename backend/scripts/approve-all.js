const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function approveAllUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farm2shelf');
    console.log('Connected to MongoDB');

    // Approve all pending users
    const result = await User.updateMany(
      { isApproved: false },
      { isApproved: true }
    );

    console.log(`Approved ${result.modifiedCount} users`);

    // List all users
    const users = await User.find({}, 'name email role isApproved');
    console.log('\nAll users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role} - ${user.isApproved ? 'Approved' : 'Pending'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

approveAllUsers();
