const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existingAdmin = await Admin.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('Admin user already exists');
    process.exit();
  }

  const admin = new Admin({
    username: 'admin',
    name: 'Admin User',
    password: 'admin123',
  });

  await admin.save();
  console.log('Admin user created');
  process.exit();
};

seedAdmin();