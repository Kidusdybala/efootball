const mongoose = require('mongoose');

const rewardMilestoneSchema = new mongoose.Schema({
  pointsRequired: { type: Number, required: true, unique: true },
  rewardCoins: { type: Number, required: true },
  label: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RewardMilestone', rewardMilestoneSchema);