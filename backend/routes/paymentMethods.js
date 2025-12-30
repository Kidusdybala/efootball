const express = require('express');
const PaymentMethod = require('../models/PaymentMethod');

const router = express.Router();

// Get all payment methods
router.get('/', async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find();
    res.json(paymentMethods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new payment method (admin only)
router.post('/', async (req, res) => {
  const paymentMethod = new PaymentMethod(req.body);
  try {
    const newPaymentMethod = await paymentMethod.save();
    res.status(201).json(newPaymentMethod);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;