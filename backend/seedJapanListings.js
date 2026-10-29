const mongoose = require('mongoose');
const Listing = require('./models/Listing');
const japanPackages = require('./japanPackages');
require('dotenv').config();

async function seedJapanListings() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const operations = japanPackages.map((listing) => ({
      updateOne: {
        filter: { type: 'coin', region: 'japan', amount: listing.amount },
        update: { $set: listing },
        upsert: true,
      },
    }));

    const result = await Listing.bulkWrite(operations);
    const synced = await Listing.find({
      type: 'coin',
      region: 'japan',
      amount: { $in: japanPackages.map(({ amount }) => amount) },
    }).select('title amount price').sort({ amount: 1 }).lean();
    console.log(`Japan packages synced. Added: ${result.upsertedCount}; updated: ${result.modifiedCount}; matched: ${result.matchedCount}.`);
    console.log(synced.map(({ amount, price }) => `${amount.toLocaleString('en-US')} coins: ${price > 0 ? `${price} Birr` : 'price pending admin setup'}`).join('\n'));
  } catch (error) {
    console.error('Failed to sync Japan packages:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedJapanListings();
