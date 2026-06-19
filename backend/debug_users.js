const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const user = await User.findOne({ email: 'kidusbeckham@gmail.com' });
      const admin = await require('./models/Admin').findOne();
      console.log('--- User Info ---');
      if (user) {
        console.log(`Email: ${user.email}, Password: "${user.password}"`);
      } else {
        console.log('User kidusbeckham@gmail.com not found');
      }
      console.log('--- Admin Info ---');
      if (admin) {
        console.log(`Admin Username: ${admin.username}, Password: "${admin.password}"`);
      } else {
        console.log('No admin found');
      }
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
