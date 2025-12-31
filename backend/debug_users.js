const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const users = await User.find({});
      console.log('--- Users in Database ---');
      users.forEach(u => {
        console.log(`Email: ${u.email}, Password: "${u.password}"`);
      });
      console.log('-------------------------');
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
