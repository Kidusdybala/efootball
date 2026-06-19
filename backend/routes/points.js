const express = require('express');
const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const RewardMilestone = require('../models/RewardMilestone');
const AdminReward = require('../models/AdminReward');
const TelegramUser = require('../models/TelegramUser');
const { verifyToken } = require('./auth');
const axios = require('axios');

const router = express.Router();

// Helper function to send Telegram notification using Rewards Bot
const sendTelegramNotification = async (chatId, text) => {
  const token = process.env.REWARDS_BOT_TOKEN;
  if (!token || !chatId) return;

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    });
    console.log(`Telegram rewards notification sent to ${chatId}`);
  } catch (error) {
    console.error('Error sending Telegram notification:', error.response?.data || error.message);
  }
};

// GET user points dashboard details
router.get('/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate rank
    const rank = await User.countDocuments({ pointsBalance: { $gt: user.pointsBalance } }) + 1;

    // Get transactions
    const transactions = await PointTransaction.find({ user: user._id }).sort({ createdAt: -1 });

    // Get admin rewards
    const adminRewards = await AdminReward.find({ user: user._id }).sort({ createdAt: -1 });

    // Get milestones
    const milestones = await RewardMilestone.find().sort({ pointsRequired: 1 });

    // Next milestone progress
    const nextMilestone = milestones.find(m => m.pointsRequired > user.pointsBalance);
    const progress = nextMilestone ? {
      milestone: nextMilestone,
      pointsNeeded: nextMilestone.pointsRequired - user.pointsBalance
    } : null;

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        pointsBalance: user.pointsBalance,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        telegramId: user.telegramId
      },
      rank,
      transactions,
      adminRewards,
      milestones,
      nextMilestone: progress
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET leaderboard (top 10 users by points)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ pointsBalance: -1 })
      .limit(10)
      .select('name email pointsBalance totalOrders totalSpent');
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users points info (Admin only)
router.get('/users', verifyToken, async (req, res) => {
  try {
    const { search, sortBy = 'pointsBalance', sortOrder = 'desc' } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .sort(sortOptions)
      .select('name email pointsBalance totalOrders totalSpent telegramId');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET points transactions log (Admin only)
router.get('/history', verifyToken, async (req, res) => {
  try {
    const transactions = await PointTransaction.find()
      .populate('user', 'name email')
      .populate('order', 'orderId')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET milestones
router.get('/milestones', async (req, res) => {
  try {
    const milestones = await RewardMilestone.find().sort({ pointsRequired: 1 });
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new milestone (Admin only)
router.post('/milestones', verifyToken, async (req, res) => {
  const { pointsRequired, rewardCoins, label } = req.body;
  try {
    const milestone = new RewardMilestone({ pointsRequired, rewardCoins, label });
    const saved = await milestone.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a milestone (Admin only)
router.put('/milestones/:id', verifyToken, async (req, res) => {
  try {
    const updated = await RewardMilestone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a milestone (Admin only)
router.delete('/milestones/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await RewardMilestone.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json({ message: 'Milestone deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST manual coin reward for user (Admin only)
router.post('/reward', verifyToken, async (req, res) => {
  const { userId, coins, note } = req.body;

  if (!userId || !coins) {
    return res.status(400).json({ message: 'User ID and coins amount are required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reward = new AdminReward({
      user: userId,
      admin: req.admin.id,
      coinsRewarded: Number(coins),
      note: note || ''
    });

    await reward.save();

    // Notify user via Telegram
    let telegramId = user.telegramId;
    if (!telegramId) {
      const tgUser = await TelegramUser.findOne({ email: user.email });
      if (tgUser) {
        telegramId = tgUser.chatId;
        user.telegramId = telegramId;
        await user.save();
      }
    }

    if (telegramId) {
      const msg = `🎁 *AuraShop Coin Reward!*\n\nYou have been rewarded with *${coins}* free coins!\n*Note:* ${note || 'No note provided'}\n\nThank you for using AuraShop!`;
      await sendTelegramNotification(telegramId, msg);
    }

    res.status(201).json({ message: 'Coins rewarded successfully', reward });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
