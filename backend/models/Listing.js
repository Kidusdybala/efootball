const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  type: { type: String, enum: ['coin', 'account', 'team'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }], // URLs or paths to images
  playerImage: { type: String }, // Player/manager image for special packs
  amount: { type: Number }, // for coins
  level: { type: Number }, // for accounts
  rating: { type: Number }, // for accounts and teams
  formation: { type: String }, // for teams
  players: [{ type: String }], // for teams
  coins: { type: Number }, // for accounts
  featured: { type: Boolean, default: false },
  discount: { type: Boolean, default: false },
  discountPercentage: { type: Number },
  discountDays: { type: Number },
  discountEndDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Listing', listingSchema);