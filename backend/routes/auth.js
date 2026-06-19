const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const TelegramUser = require('../models/TelegramUser');

const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Admin login attempt:', username);

  try {
    const admin = await Admin.findOne({ username });
    console.log('Admin found:', !!admin);
    if (!admin) {
      console.log('Admin not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValid = admin.comparePassword(password);
    console.log('Password valid:', isValid);
    if (!isValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);
    res.json({ token, admin: { id: admin._id, name: admin.name, username: admin.username } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// User signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({ name, email: normalizedEmail, password });

    // Check if user already linked their email via Telegram Bot
    const tgUser = await TelegramUser.findOne({ email: normalizedEmail });
    if (tgUser) {
      user.telegramId = tgUser.chatId;
    }

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  let { email, password } = req.body;
  if (email) email = email.toLowerCase().trim();
  if (password) password = password.trim();
  
  console.log('User login attempt:', email, 'Password:', password);

  try {
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    if (user) {
      console.log('Stored password:', user.password);
      console.log('Password match:', user.password === password);
    }
    
    if (!user || !(user.comparePassword(password))) {
      console.log('Login failed: Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful');
    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Update admin profile
router.put('/admin/profile', verifyToken, async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // If updating password, verify current password
    if (newPassword) {
      const isValid = admin.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      admin.password = newPassword;
    }

    // Update name if provided
    if (name) {
      admin.name = name;
    }

    await admin.save();
    res.json({ message: 'Profile updated successfully', admin: { id: admin._id, name: admin.name, username: admin.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { router, verifyToken };
