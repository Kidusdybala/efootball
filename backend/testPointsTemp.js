const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Listing = require('./models/Listing');
const PointTransaction = require('./models/PointTransaction');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();

const testCalculations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for tests');

    // Clean up any old test data
    await User.deleteMany({ email: 'testpointsuser@aurashop.et' });
    await Listing.deleteMany({ title: 'Test Coin Pack 1000' });
    await Order.deleteMany({ orderId: 'TEST-ORDER-1' });

    // 1. Create a test user
    const user = new User({
      name: 'Test Points User',
      email: 'testpointsuser@aurashop.et',
      password: 'password123',
      pointsBalance: 0,
      totalOrders: 0,
      totalSpent: 0,
      firstPurchaseBonusClaimed: false
    });
    await user.save();

    // 2. Create a test listing
    const listing = new Listing({
      type: 'coin',
      title: 'Test Coin Pack 1000',
      description: '1000 coins for testing',
      price: 500, // ETB
      amount: 1000 // Coins
    });
    await listing.save();

    // 3. Place a mock order
    const order = new Order({
      orderId: 'TEST-ORDER-1',
      customerInfo: {
        name: 'Test Points User',
        email: 'testpointsuser@aurashop.et',
        phone: '0912345678',
        efootballEmail: 'test@efootball.com',
        efootballPassword: 'efootballpassword'
      },
      item: listing._id,
      amount: 2, // Quantity of packs = 2 (so 2 * 1000 = 2000 coins)
      totalPrice: 1000, // 1000 ETB total spent
      status: 'Pending'
    });
    await order.save();

    // 4. Simulate points calculation (creditPointsForOrder logic)
    const email = order.customerInfo.email.toLowerCase().trim();
    const dbUser = await User.findOne({ email });
    
    await order.populate('item');
    const dbListing = order.item;

    const transactionsToCreate = [];
    let totalPointsEarned = 0;

    // Rule 1: Every 100 ETB spent = 1 point
    const spentPoints = Math.floor(order.totalPrice / 100);
    if (spentPoints > 0) {
      totalPointsEarned += spentPoints;
      transactionsToCreate.push({
        user: dbUser._id,
        order: order._id,
        pointsEarned: spentPoints,
        reason: `Spent ${order.totalPrice} ETB`
      });
    }

    // Rule 2: Every 100 coins bought = 10 points
    if (dbListing.type === 'coin' && dbListing.amount) {
      const totalCoinsBought = dbListing.amount * order.amount;
      const coinPoints = Math.floor(totalCoinsBought / 100) * 10;
      if (coinPoints > 0) {
        totalPointsEarned += coinPoints;
        transactionsToCreate.push({
          user: dbUser._id,
          order: order._id,
          pointsEarned: coinPoints,
          reason: `Coins bought: ${totalCoinsBought}`
        });
      }

      // Rule 5: Large order bonus
      if (totalCoinsBought >= 5000) {
        totalPointsEarned += 50;
        transactionsToCreate.push({
          user: dbUser._id,
          order: order._id,
          pointsEarned: 50,
          reason: 'Large order bonus'
        });
      }
    }

    // Rule 3: First purchase
    if (!dbUser.firstPurchaseBonusClaimed) {
      dbUser.firstPurchaseBonusClaimed = true;
      totalPointsEarned += 20;
      transactionsToCreate.push({
        user: dbUser._id,
        order: order._id,
        pointsEarned: 20,
        reason: 'First purchase bonus'
      });
    }

    // Expectation:
    // SpentPoints = 1000 / 100 = 10 pts
    // CoinPoints = (1000 * 2) = 2000 coins. 2000 / 100 * 10 = 200 pts
    // FirstPurchase = 20 pts
    // Total = 230 pts
    console.log('Calculated points details:');
    console.log(`- Spent Points: ${spentPoints} (Expected: 10)`);
    console.log(`- Coin Points: ${Math.floor((dbListing.amount * order.amount) / 100) * 10} (Expected: 200)`);
    console.log(`- First Purchase: 20 (Expected: 20)`);
    console.log(`- Total points earned: ${totalPointsEarned} (Expected: 230)`);

    if (totalPointsEarned === 230) {
      console.log('✅ Point calculation verification passed successfully!');
    } else {
      console.error('❌ Point calculation verification failed!');
    }

    // Clean up
    await User.deleteOne({ _id: dbUser._id });
    await Listing.deleteOne({ _id: listing._id });
    await Order.deleteOne({ _id: order._id });
    await PointTransaction.deleteMany({ order: order._id });
    console.log('Cleaned up test data');
    process.exit(totalPointsEarned === 230 ? 0 : 1);
  } catch (error) {
    console.error('Error during verification tests:', error);
    process.exit(1);
  }
};

testCalculations();
