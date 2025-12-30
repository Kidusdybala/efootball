const express = require('express');
const Order = require('../models/Order');
const TelegramUser = require('../models/TelegramUser');
const { verifyToken } = require('./auth');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

// Multer config for receipt uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
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

      const message = `New Payment Receipt\nOrder ID: ${order.orderId}\nName: ${order.customerInfo?.name || 'N/A'}\nEmail: ${order.customerInfo?.email || 'N/A'}\nPhone: ${order.customerInfo?.phone || 'N/A'}\nAmount: ${order.totalPrice}`;
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