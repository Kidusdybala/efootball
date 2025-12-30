const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const TelegramBot = require('node-telegram-bot-api');
const TelegramUser = require('./models/TelegramUser');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Telegram Bot Setup - Temporarily disabled due to multiple instance conflict
// const botToken = process.env.TELEGRAM_BOT_TOKEN;
// const bot = new TelegramBot(botToken, { polling: true });

// Bot message handler - Temporarily disabled
// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;

//   if (text && text.toLowerCase().includes('@')) {
//     // Assume it's an email
//     const email = text.trim();
//     try {
//       await TelegramUser.findOneAndUpdate(
//         { email },
//         { chatId: chatId.toString(), username: msg.from.username },
//         { upsert: true, new: true }
//       );
//       bot.sendMessage(chatId, `✅ Your email ${email} has been registered for notifications!`);
//     } catch (error) {
//       console.error('Error registering user:', error);
//       bot.sendMessage(chatId, '❌ Error registering your email. Please try again.');
//     }
//   } else {
//     bot.sendMessage(chatId, '👋 Welcome! Please send your email address to register for order notifications.');
//   }
// });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('MongoDB connected');

  // Routes
  app.use('/api/auth', require('./routes/auth').router);
  app.use('/api/listings', require('./routes/listings'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/payment-methods', require('./routes/paymentMethods'));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.log(err));