const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const TelegramBot = require('node-telegram-bot-api');
const TelegramUser = require('./models/TelegramUser');
const User = require('./models/User');
const RewardMilestone = require('./models/RewardMilestone');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Telegram Bot Setup - Temporarily disabled due to multiple instance conflict
// const botToken = process.env.TELEGRAM_BOT_TOKEN;
// const bot = new TelegramBot(botToken, { polling: true });

// Bot message handler - Temporarily disabled
// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;

//   if (text && text.toLowerCase().includes('@')) {
//     // Assume it's an email
//     const email = text.trim();
//     try {
//       await TelegramUser.findOneAndUpdate(
//         { email },
//         { chatId: chatId.toString(), username: msg.from.username },
//         { upsert: true, new: true }
//       );
//       bot.sendMessage(chatId, `✅ Your email ${email} has been registered for notifications!`);
//     } catch (error) {
//       console.error('Error registering user:', error);
//       bot.sendMessage(chatId, '❌ Error registering your email. Please try again.');
//     }
//   } else {
//     bot.sendMessage(chatId, '👋 Welcome! Please send your email address to register for order notifications.');
//   }
// });

// Rewards Telegram Bot Setup
const rewardsBotToken = process.env.REWARDS_BOT_TOKEN;
let rewardsBot;

const userStates = {};

if (rewardsBotToken) {
  rewardsBot = new TelegramBot(rewardsBotToken, { polling: true });

  rewardsBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (!text) return;

    if (text.toLowerCase() === '/leaderboard') {
      const adminChatId = process.env.TELEGRAM_CHAT_ID;
      if (chatId.toString() !== adminChatId) {
        return rewardsBot.sendMessage(chatId, '❌ Unauthorized. This command is for admins only.');
      }
      
      try {
        const topUsers = await User.find().sort({ pointsBalance: -1 }).limit(10);
        let message = '📊 *Points Leaderboard*\n\n';
        if (topUsers.length === 0) {
          message += 'No users found.';
        } else {
          topUsers.forEach((u, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            message += `${medal} *${u.name}* — ${u.pointsBalance} pts\n`;
          });
        }
        
        return rewardsBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching leaderboard for bot:', error);
        return rewardsBot.sendMessage(chatId, '❌ Error fetching leaderboard.');
      }
    }

    if (text === '/start' || text.toLowerCase() === '/mypoints') {
      try {
        let user = await User.findOne({ telegramId: chatId.toString() });
        
        if (!user) {
          const tgUser = await TelegramUser.findOne({ chatId: chatId.toString() });
          if (tgUser) {
            user = await User.findOne({ email: tgUser.email.toLowerCase() });
            if (user) {
              user.telegramId = chatId.toString();
              await user.save();
            }
          }
        }

        if (!user) {
          userStates[chatId] = { step: 'AWAITING_EMAIL' };
          return rewardsBot.sendMessage(
            chatId,
            `*Welcome to AuraShop Rewards!*\n\nYour account is not linked yet. Please send your registered email address first.`,
            { parse_mode: 'Markdown' }
          );
        }

        const rank = await User.countDocuments({ pointsBalance: { $gt: user.pointsBalance } }) + 1;
        const milestones = await RewardMilestone.find().sort({ pointsRequired: 1 });
        const nextMilestone = milestones.find(m => m.pointsRequired > user.pointsBalance);

        let milestoneMessage = '';
        if (nextMilestone) {
          const pointsAway = nextMilestone.pointsRequired - user.pointsBalance;
          milestoneMessage = `*Next Reward:* ${pointsAway} pts away from *${nextMilestone.label}* (${nextMilestone.rewardCoins} free coins)`;
        } else {
          milestoneMessage = `You have reached the highest milestone! VIP Rank Active!`;
        }

        const message = `*Your AuraShop Points*\n\n` +
          `*Name:* ${user.name}\n` +
          `*Points:* ${user.pointsBalance} pts\n` +
          `*Rank:* #${rank} out of all users\n` +
          `*Total Orders:* ${user.totalOrders}\n` +
          `*Total Spent:* ${user.totalSpent.toFixed(2)} ETB\n\n` +
          `${milestoneMessage}`;

        rewardsBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error fetching points in bot:', error);
        rewardsBot.sendMessage(chatId, '❌ Error fetching your points. Please try again later.');
      }
    } else if (text.includes('@')) {
      const email = text.toLowerCase().trim();
      userStates[chatId] = { step: 'AWAITING_PASSWORD', email: email };
      return rewardsBot.sendMessage(chatId, 'Great! Now please send your password for this account.');
    } else if (userStates[chatId] && userStates[chatId].step === 'AWAITING_PASSWORD') {
      const email = userStates[chatId].email;
      const password = text;

      try {
        const user = await User.findOne({ email });
        
        if (!user) {
          delete userStates[chatId];
          return rewardsBot.sendMessage(
            chatId,
            `ℹ️ *Account Not Found*\n\nWe couldn't find an AuraShop account for *${email}*. Please sign up on the website first.`,
            { parse_mode: 'Markdown' }
          );
        }

        if (!user.comparePassword(password)) {
          return rewardsBot.sendMessage(chatId, '❌ Invalid password. Please try again.');
        }

        await TelegramUser.findOneAndUpdate(
          { email },
          { chatId: chatId.toString(), username: msg.from?.username || '' },
          { upsert: true, new: true }
        );

        user.telegramId = chatId.toString();
        await user.save();
        
        delete userStates[chatId];
        rewardsBot.sendMessage(
          chatId,
          `*Success!*\n\nYour account *${user.name}* (${email}) has been successfully linked.\nUse \`/mypoints\` to view your rewards balance at any time!`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('Error linking email in bot:', error);
        rewardsBot.sendMessage(chatId, '❌ Error linking your account. Please try again.');
      }
    } else {
      userStates[chatId] = { step: 'AWAITING_EMAIL' };
      rewardsBot.sendMessage(chatId, 'Welcome! Send `/mypoints` to view your points, or send your registered email address first to link your account.', { parse_mode: 'Markdown' });
    }
  });

  rewardsBot.on('polling_error', (error) => {
    console.error('Rewards Bot polling error:', error.message);
  });

  const PROMO_MESSAGE = `⚡️🎮 AURA XI – Your Ultimate eFootball Hub! 🎮⚡️
Welcome to AURA XI, where passion meets performance! 🚀
💰 Premium eFootball Coins Available
Power up your dream squad with fast, reliable, and trusted coin services.
🎁 LIVE TikTok Pack Openings
Experience the thrill in real time! Join our exciting live streams as we open packs, chase epic cards, and celebrate massive pulls together.
🏆 Division 1 Boosting & Coaching
Struggling to reach the top? Our experienced players help you climb the ranks and achieve Division 1 with confidence and skill.
✨ Trusted Service
✨ Fast Delivery
✨ Competitive Prices
✨ Dedicated Community
🔥 Join AURA XI today and take your eFootball journey to the next level!
📢 Coins • Pack Openings • Division 1 Assistance
⚽️ The road to greatness starts here.
#eFootball #AURAXI #Division1 #eFootballCoins #PackOpening #GamingCommunity`;

  const SEVEN_HOURS = 7 * 60 * 60 * 1000;
  setInterval(() => {
    rewardsBot.sendMessage('@aurashop333', PROMO_MESSAGE).catch(err => {
      console.error('Error posting promo to channel:', err.message);
    });
  }, SEVEN_HOURS);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://aurashop.et',
  'https://www.aurashop.et', 
  'https://efootball-97ku.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('MongoDB connected');

  // Routes
  app.use('/api/auth', require('./routes/auth').router);
  app.use('/api/listings', require('./routes/listings'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/payment-methods', require('./routes/paymentMethods'));
  app.use('/api/points', require('./routes/points'));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => console.log(err));

// Graceful shutdown to prevent polling conflicts during nodemon reload
const shutdownBot = async () => {
  if (rewardsBot && rewardsBot.isPolling()) {
    console.log('Shutting down Rewards Telegram Bot polling...');
    try {
      await rewardsBot.stopPolling();
    } catch (e) {
      console.error('Error stopping rewards bot polling:', e);
    }
  }
};

process.once('SIGUSR2', async () => {
  await shutdownBot();
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', async () => {
  await shutdownBot();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdownBot();
  process.exit(0);
});