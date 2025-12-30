const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const checkAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const admin = await Admin.findOne({ username: 'admin' });
  if (admin) {
    console.log('Admin password:', admin.password);
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare('admin123', admin.password);
    console.log('Password check:', isValid);
    if (!isValid) {
      admin.password = 'admin123';
      await admin.save();
      console.log('Password updated');
    }
  } else {
    console.log('Admin not found');
  }
  process.exit();
};

checkAdmin();