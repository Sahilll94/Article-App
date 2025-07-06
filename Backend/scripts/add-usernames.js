const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const generateUsernameFromName = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20) || 'user';
};

const addUsernamesToExistingUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find users without usernames
    const usersWithoutUsernames = await User.find({ 
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' }
      ]
    });

    console.log(`Found ${usersWithoutUsernames.length} users without usernames`);

    for (const user of usersWithoutUsernames) {
      let baseUsername = generateUsernameFromName(user.name);
      let username = baseUsername;
      let counter = 1;

      // Check if username exists and add number if needed
      while (await User.findOne({ username, _id: { $ne: user._id } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Update user with new username
      await User.findByIdAndUpdate(user._id, { username });
      console.log(`Updated user ${user.name} with username: ${username}`);
    }

    console.log('Username migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during username migration:', error);
    process.exit(1);
  }
};

// Run the migration
addUsernamesToExistingUsers();
