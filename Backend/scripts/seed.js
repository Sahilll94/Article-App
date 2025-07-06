const { connectDB, disconnectDB } = require('../config/database');
const { seedData } = require('../utils/seedData');

const runSeeder = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Starting data seeding...');
    await seedData();
    
    console.log('Seeding completed successfully!');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

runSeeder();
