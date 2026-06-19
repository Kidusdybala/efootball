const mongoose = require('mongoose');
const RewardMilestone = require('./models/RewardMilestone');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();

const seedMilestones = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding milestones');

    // Clear existing milestones
    await RewardMilestone.deleteMany({});
    console.log('Cleared existing milestones');

    const defaultMilestones = [
      {
        pointsRequired: 100,
        rewardCoins: 100,
        label: '100 Points Milestone'
      },
      {
        pointsRequired: 250,
        rewardCoins: 300,
        label: '250 Points Milestone'
      },
      {
        pointsRequired: 500,
        rewardCoins: 700,
        label: '500 Points Milestone'
      },
      {
        pointsRequired: 1000,
        rewardCoins: 1500,
        label: '1000 Points Milestone + VIP'
      }
    ];

    await RewardMilestone.insertMany(defaultMilestones);
    console.log('Successfully seeded default reward milestones');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding milestones:', error);
    process.exit(1);
  }
};

seedMilestones();
