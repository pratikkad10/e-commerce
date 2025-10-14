import 'dotenv/config';
import connectDB from '../config/database.js';
import { seedDatabase, clearDatabase } from '../utils/seeder.js';

const runSeeder = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('📡 Connected to database');

    // Check command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'clear':
        await clearDatabase();
        break;
      case 'seed':
        await seedDatabase();
        break;
      case 'reset':
        await clearDatabase();
        await seedDatabase();
        break;
      default:
        console.log('📖 Usage:');
        console.log('  npm run seed        - Seed database with initial data');
        console.log('  npm run seed clear  - Clear all data');
        console.log('  npm run seed reset  - Clear and reseed database');
        break;
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
};

runSeeder();