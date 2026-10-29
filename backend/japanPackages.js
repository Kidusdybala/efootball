const japanPackages = [
  { amount: 105, price: 300 },
  { amount: 315, price: 600 },
  { amount: 525, price: 800 },
  { amount: 1050, price: 1700 },
  { amount: 2100, price: 3359 },
  { amount: 3150, price: 4950 },
].map(({ amount, price }) => ({
  type: 'coin',
  title: `Japan ${amount.toLocaleString('en-US')} Coins`,
  description: `${amount.toLocaleString('en-US')} eFootball Coins - Japan Region`,
  price,
  amount,
  bonusCoins: 0,
  images: ['/coins/a4i9p0vdi8dd1-removebg-preview.png'],
  region: 'japan',
  regionImage: '/assets/Flag_of_Japan.svg.png',
  discount: false,
}));

module.exports = japanPackages;
