const japanPackages = [
  { amount: 840, price: 950, title: 'Japan 840 Coins' },
  { amount: 260, price: 350, title: 'Japan 260 Coins' },
  { amount: 2700, price: 2900, title: '2700 Coins (Discount)', discount: true },
  { amount: 105, price: 300 },
  { amount: 315, price: 600 },
  { amount: 525, price: 800 },
  { amount: 1050, price: 1700 },
  { amount: 2100, price: 3359 },
  { amount: 3150, price: 4950 },
  { amount: 10500, price: 0 },
  { amount: 15750, price: 0 },
  { amount: 30000, price: 0 },
].map(({ amount, price, title, discount = false }) => ({
  type: 'coin',
  title: title || `Japan ${amount.toLocaleString('en-US')} Coins`,
  description: `${amount.toLocaleString('en-US')} eFootball Coins - Japan Region`,
  price,
  amount,
  bonusCoins: 0,
  images: ['/coins/discount.png'],
  region: 'japan',
  regionImage: '/assets/Flag_of_Japan.svg.png',
  discount,
}));

module.exports = japanPackages;
