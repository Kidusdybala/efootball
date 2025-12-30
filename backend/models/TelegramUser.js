const mongoose = require('mongoose');

const telegramUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  chatId: { type: String, required: true },
  username: { type: String },
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TelegramUser', telegramUserSchema);