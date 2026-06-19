const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telegramId: { type: String },
  pointsBalance: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  firstPurchaseBonusClaimed: { type: Boolean, default: false },
  weekStart: { type: Date },
  purchasesThisWeek: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.methods.comparePassword = function(candidatePassword) {
  return this.password === candidatePassword;
};

module.exports = mongoose.model('User', userSchema);