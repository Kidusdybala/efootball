const express = require('express');
const Order = require('../models/Order');
const TelegramUser = require('../models/TelegramUser');
const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const RewardMilestone = require('../models/RewardMilestone');
const { verifyToken } = require('./auth');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

// Multer config for receipt uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper to credit points for completed orders
const creditPointsForOrder = async (orderId, order) => {
  const existingTx = await PointTransaction.findOne({ order: order._id });
  if (existingTx) {
    console.log(`Points already credited for order ${orderId}`);
    return;
  }

  const email = order.customerInfo.email.toLowerCase().trim();
  const user = await User.findOne({ email });
  if (!user) {
    console.log(`No registered user found for email ${email}. Points will not be credited.`);
    return;
  }

  if (!order.populated('item')) {
    await order.populate('item');
  }
  const listing = order.item;
  if (!listing) {
    console.log(`Warning: No listing found for order item. Proceeding with base points only.`);
  }

  const transactionsToCreate = [];
  let totalPointsEarned = 0;

  // Rule 1: Every 100 ETB spent = 1 point
  const spentPoints = Math.floor(order.totalPrice / 100);
  if (spentPoints > 0) {
    totalPointsEarned += spentPoints;
    transactionsToCreate.push({
      user: user._id,
      order: order._id,
      pointsEarned: spentPoints,
      reason: `Purchase amount: Spent ${order.totalPrice.toFixed(2)} ETB`
    });
  }

  // Rule 2: Every 100 coins bought = 10 points
  if (listing && listing.type === 'coin' && listing.amount) {
    const totalCoinsBought = listing.amount * order.amount;
    const coinPoints = Math.floor(totalCoinsBought / 100) * 10;
    if (coinPoints > 0) {
      totalPointsEarned += coinPoints;
      transactionsToCreate.push({
        user: user._id,
        order: order._id,
        pointsEarned: coinPoints,
        reason: `Coins bought: ${totalCoinsBought} coins`
      });
    }

    // Rule 5: Large order bonus (5000+ coins) = +50 points
    if (totalCoinsBought >= 5000) {
      totalPointsEarned += 50;
      transactionsToCreate.push({
        user: user._id,
        order: order._id,
        pointsEarned: 50,
        reason: 'Large order bonus (5000+ coins)'
      });
    }
  }

  // Rule 3: First purchase bonus = +20 points
  if (!user.firstPurchaseBonusClaimed) {
    user.firstPurchaseBonusClaimed = true;
    totalPointsEarned += 20;
    transactionsToCreate.push({
      user: user._id,
      order: order._id,
      pointsEarned: 20,
      reason: 'First purchase bonus'
    });
  }

  // Rule 4: Streak (3 purchases in a week) = +15 bonus
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  if (!user.weekStart || user.weekStart < oneWeekAgo) {
    user.weekStart = new Date();
    user.purchasesThisWeek = 1;
  } else {
    user.purchasesThisWeek += 1;
    if (user.purchasesThisWeek === 3) {
      totalPointsEarned += 15;
      transactionsToCreate.push({
        user: user._id,
        order: order._id,
        pointsEarned: 15,
        reason: 'Streak bonus (3 purchases in a week)'
      });
    }
  }

  if (totalPointsEarned > 0) {
    const oldPoints = user.pointsBalance;
    user.pointsBalance += totalPointsEarned;
    user.totalOrders += 1;
    user.totalSpent += order.totalPrice;
    await user.save();

    await PointTransaction.insertMany(transactionsToCreate);

    let telegramId = user.telegramId;
    if (!telegramId) {
      const tgUser = await TelegramUser.findOne({ email: user.email });
      if (tgUser) {
        telegramId = tgUser.chatId;
        user.telegramId = telegramId;
        await user.save();
      }
    }

    const botToken = process.env.REWARDS_BOT_TOKEN;
    if (botToken && telegramId) {
      const txDetails = transactionsToCreate.map(tx => `• +${tx.pointsEarned} pts (${tx.reason})`).join('\n');
      const msg = `🎉 *Points Credited!*\n\nYou earned *+${totalPointsEarned}* points for order *${order.orderId}*.\n` +
        `Current points balance: *${user.pointsBalance}* pts.\n\n` +
        `*Details:*\n${txDetails}`;

      try {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: telegramId,
          text: msg,
          parse_mode: 'Markdown'
        });
      } catch (tgError) {
        console.error('Error sending points Telegram notification:', tgError.response?.data || tgError.message);
      }
    }

    const milestones = await RewardMilestone.find().sort({ pointsRequired: 1 });
    for (const milestone of milestones) {
      if (user.pointsBalance >= milestone.pointsRequired && oldPoints < milestone.pointsRequired) {
        if (botToken && telegramId) {
          const milestoneMsg = `🏆 *Milestone Reached!*\n\n` +
            `Congratulations! You reached the milestone *${milestone.label}* (${milestone.pointsRequired} pts).\n` +
            `You have been rewarded with *${milestone.rewardCoins}* free coins! 🎁`;
          try {
            await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              chat_id: telegramId,
              text: milestoneMsg,
              parse_mode: 'Markdown'
            });
          } catch (tgError) {
            console.error('Error sending milestone Telegram notification:', tgError.response?.data || tgError.message);
          }
        }
      }
    }
  }
};

// Get all orders (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().populate('item');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new order (for users, but since no user auth, maybe public or handle differently)
router.post('/', async (req, res) => {
  const order = new Order(req.body);
  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get orders by user email
router.get('/user/:email', async (req, res) => {
  try {
    const orders = await Order.find({ 'customerInfo.email': req.params.email }).populate('item').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single order by orderId
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const newStatus = req.body.status;
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
    
    // If status changed to Delivered, calculate and credit points
    if (newStatus === 'Delivered' && oldOrder.status !== 'Delivered') {
      try {
        await creditPointsForOrder(updatedOrder.orderId, updatedOrder);
      } catch (pointsError) {
        console.error('Error crediting points:', pointsError);
      }
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Upload receipt for an order
router.post('/:orderId/receipt', upload.single('receipt'), async (req, res) => {
  try {
    console.log('Receipt upload attempt for orderId:', req.params.orderId);
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      console.log('Order not found:', req.params.orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('File received:', req.file.originalname);

    // Send to Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID'; // Need to set this
    console.log('Bot token:', botToken ? 'set' : 'not set');
    console.log('Chat ID:', chatId);

    if (chatId !== 'YOUR_CHAT_ID') {
      console.log('Sending photo to Telegram');
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('photo', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      await order.populate('item');
      const typeDisplay = order.item?.type === 'coin' ? 'coins' : order.item?.type === 'account' ? 'accounts' : order.item?.type || 'N/A';
      const message = `New Payment Receipt\nOrder ID: ${order.orderId}\nType: ${typeDisplay}\nName: ${order.customerInfo?.name || 'N/A'}\nEmail: ${order.customerInfo?.email || 'N/A'}\nPhone: ${order.customerInfo?.phone || 'N/A'}\nAmount: ${order.totalPrice}\nAccount Email: ${order.customerInfo?.efootballEmail || 'N/A'}\nAccount Password: ${order.customerInfo?.efootballPassword || 'N/A'}`;
      form.append('caption', message);

      try {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, form, {
          headers: form.getHeaders(),
        });
        console.log('Photo sent to admin chat');
      } catch (telegramError) {
        console.error('Error sending photo to Telegram:', telegramError.response?.data || telegramError.message);
      }
    }

    // Send notification to user if registered
    const userEmail = order.customerInfo?.email;
    if (userEmail) {
      const telegramUser = await TelegramUser.findOne({ email: userEmail });
      if (telegramUser) {
        try {
          await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: telegramUser.chatId,
            text: `✅ Receipt Uploaded Successfully!\n\nOrder ID: ${order.orderId}\nYour payment receipt has been submitted and is being reviewed.\n\nWe'll notify you once it's verified.`,
          });
        } catch (error) {
          console.error('Error sending to user:', error);
        }
      }
    }

    // Update order with receipt URL or mark as uploaded
    order.receiptUrl = 'uploaded'; // Or store URL if needed
    await order.save();

    res.json({ message: 'Receipt uploaded and notifications sent' });
  } catch (err) {
    console.error('Error uploading receipt:', err);
    res.status(500).json({ message: 'Error uploading receipt' });
  }
});

module.exports = router;