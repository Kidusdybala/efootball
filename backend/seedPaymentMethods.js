const mongoose = require('mongoose');
const PaymentMethod = require('./models/PaymentMethod');
require('dotenv').config();

const seedPaymentMethods = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear existing payment methods
  await PaymentMethod.deleteMany({});

  const paymentMethods = [
    {
      name: 'CBE',
      accountName: 'MURAD GENA',
      accountNumber: '1000648228736',
      image: '/assets/commercial-bank-of-ethiopia-logo-png_seeklogo-547506.png',
    },
    {
      name: 'BOA',
      accountName: 'GENA AMAN',
      image: '/assets/abysinnia.jpg',
    },
    {
      name: 'Awash Bank',
      accountName: 'GENA AMAN',
      accountNumber: '013100169502500',
      image: '/assets/awash.png',
    },
    {
      name: 'TeleBirr',
      accountName: 'MURAD GENA',
      accountNumber: '0909844959',
      image: '/assets/Telebirr.png',
    },
    {
      name: 'Mpesa',
      accountName: 'MURAD GENA',
      accountNumber: '0707844959',
      image: '/assets/m pesa.png',
    },
    {
      name: 'Dashen Bank',
      accountName: 'GENA AMAN',
      image: '/assets/Dashen_Bank.png',
    },
    {
      name: 'eBirr',
      accountName: 'MURAD GENA',
      accountNumber: '0909844959',
      image: '/assets/e birr.png',
    },
    {
      name: 'CbeBirr',
      accountName: 'MURAD GENA',
      accountNumber: '0909844959',
      image: '/assets/CBE birr.jpg',
    },
  ];

  await PaymentMethod.insertMany(paymentMethods);
  console.log('Payment methods seeded');
  process.exit();
};

seedPaymentMethods();