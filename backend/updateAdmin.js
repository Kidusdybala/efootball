const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const updateAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const admin = await Admin.findOne({ username: 'admin' });
  if (admin) {
    const bcrypt = require('bcryptjs');
    admin.password = await bcrypt.hash('admin123', 10);
    await admin.save();
    console.log('Admin password updated');
  } else {
    console.log('Admin not found');
  }
  process.exit();
};

updateAdmin();