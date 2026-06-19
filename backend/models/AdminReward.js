const mongoose = require('mongoose');

const adminRewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  coinsRewarded: { type: Number, required: true },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdminReward', adminRewardSchema);