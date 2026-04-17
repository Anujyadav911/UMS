import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    await User.deleteMany();

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ums.com',
      password: 'password123',
      role: 'admin',
      status: 'active'
    });

    console.log('Data Imported - Admin user created with email: admin@ums.com and password: password123');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  console.log('Destroy data not implemented');
  process.exit();
} else {
  importData();
}
