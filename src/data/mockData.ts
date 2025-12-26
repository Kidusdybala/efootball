import { CoinPackage, Account, Team, Order } from '@/types';
import accountImage from '@/assets/account-card.jpg';
import coin1 from '@/assets/coins/1e933f35ec6ededd0a0ac64294e991ee-removebg-preview.png';
import coin2 from '@/assets/coins/a4i9p0vdi8dd1-removebg-preview.png';
import coin3 from '@/assets/coins/d9af6ddb1dcd78d12657af728a08421f-removebg-preview.png';
import team1 from '@/assets/teams/2abc9e5b3b48009af50a016530aa6af6.jpg';
import team2 from '@/assets/teams/352be9320c1d8682ce6b0da5aeb51aaa.jpg';
import team3 from '@/assets/teams/3d0fac9139511c599579d12daeffdf85.jpg';
import team4 from '@/assets/teams/4d16b11b664be199dc41acc9ee2d9c79.jpg';
import team5 from '@/assets/teams/83b2288ce46adf26ccded8a2677ce6d1.jpg';
import team6 from '@/assets/teams/e31b1b057ca3b49857a23114ac0e5e71.jpg';
import telebirrImage from '@/assets/Telebirr.png';
import cbeImage from '@/assets/CBE birr.jpg';
import dashenImage from '@/assets/Dashen_Bank.png';
import abysinniaImage from '@/assets/abysinnia.jpg';
import bunaImage from '@/assets/buna.png';
import commercialImage from '@/assets/commercial-bank-of-ethiopia-logo-png_seeklogo-547506.png';

export const coinPackages: CoinPackage[] = [
  {
    id: '1',
    title: '100 Coins',
    description: 'Small coin pack',
    price: 120,
    amount: 100,
    image: coin1,
    featured: false,
  },
  {
    id: '2',
    title: '300 Coins',
    description: 'Medium coin pack',
    price: 280,
    amount: 300,
    image: coin2,
  },
  {
    id: '3',
    title: '500 Coins',
    description: 'Large coin pack',
    price: 480,
    amount: 500,
    image: coin3,
    discount: true,
  },
  {
    id: '4',
    title: '800 Coins',
    description: 'Extra large coin pack',
    price: 600,
    amount: 800,
    image: coin1,
  },
  {
    id: '5',
    title: '1000 Coins',
    description: 'Ultimate coin pack',
    price: 750,
    amount: 1000,
    image: coin2,
    discount: true,
  },
  {
    id: '6',
    title: '3000 Coins',
    description: 'Maximum coin pack',
    price: 2000,
    amount: 3000,
    image: coin3,
  },
];

export const Accounts: Account[] = [
  {
    id: '1',
    title: 'Pro Account Lv.50',
    description: 'High-level account with legendary players',
    price: 49.99,
    rating: 94,
    level: 50,
    coins: 2000000,
    players: 45,
    image: team1,
    discount: true,
  },
  {
    id: '2',
    title: 'Starter Account Lv.20',
    description: 'Perfect for beginners with good foundation',
    price: 19.99,
    rating: 82,
    level: 20,
    coins: 500000,
    players: 25,
    image: team2,
  },
  {
    id: '3',
    title: 'Elite Account Lv.80',
    description: 'Top-tier account with full squad',
    price: 99.99,
    rating: 97,
    level: 80,
    coins: 5000000,
    players: 60,
    image: team3,
    discount: true,
  },
  {
    id: '4',
    title: 'Mid-tier Account Lv.35',
    description: 'Balanced account for competitive play',
    price: 34.99,
    rating: 88,
    level: 35,
    coins: 1000000,
    players: 35,
    image: team4,
  },
];

export const teams: Team[] = [
  {
    id: '1',
    title: 'Team One',
    description: 'Complete team one',
    price: 3600,
    formation: '4-3-3',
    rating: 90,
    players: ['Player1', 'Player2', 'Player3', 'Player4'],
    image: team1,
    discount: true,
  },
  {
    id: '2',
    title: 'Team 2',
    description: 'Complete team 2',
    price: 4800,
    formation: '4-3-3',
    rating: 91,
    players: ['Player5', 'Player6', 'Player7', 'Player8'],
    image: team2,
  },
  {
    id: '3',
    title: 'Team 3',
    description: 'Complete team 3',
    price: 9888,
    formation: '4-2-3-1',
    rating: 92,
    players: ['Player9', 'Player10', 'Player11', 'Player12'],
    image: team3,
    discount: true,
  },
  {
    id: '4',
    title: 'Team 4',
    description: 'Complete team 4',
    price: 7328,
    formation: '4-3-3',
    rating: 93,
    players: ['Player13', 'Player14', 'Player15', 'Player16'],
    image: team4,
  },
  {
    id: '5',
    title: 'Team 5',
    description: 'Complete team 5',
    price: 3233,
    formation: '4-2-3-1',
    rating: 94,
    players: ['Player17', 'Player18', 'Player19', 'Player20'],
    image: team5,
  },
  {
    id: '6',
    title: 'Team 6',
    description: 'Complete team 6',
    price: 4777,
    formation: '4-3-3',
    rating: 95,
    players: ['Player21', 'Player22', 'Player23', 'Player24'],
    image: team6,
    discount: true,
  },
];

export const sampleOrders: Order[] = [
  {
    id: '1',
    orderId: 'AUR-001234',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    customerEmail: 'john@example.com',
    itemType: 'coin',
    itemId: '1',
    itemTitle: '500K Coins',
    quantity: 2,
    totalPrice: 11.98,
    status: 'pending',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    orderId: 'AUR-001235',
    customerName: 'Jane Smith',
    customerPhone: '+0987654321',
    customerEmail: 'jane@example.com',
    itemType: 'account',
    itemId: '1',
    itemTitle: 'Pro Account Lv.50',
    quantity: 1,
    totalPrice: 49.99,
    status: 'paid',
    createdAt: new Date('2024-01-16'),
  },
];

export const banks = [
  {
    id: '1',
    bankName: 'TeleBirr',
    accountName: 'AURA SHOP',
    accountNumber: '1234567890',
    routingNumber: '987654321',
    image: telebirrImage,
  },
  {
    id: '2',
    bankName: 'CBE',
    accountName: 'AURA SHOP',
    accountNumber: '0987654321',
    routingNumber: '123456789',
    image: cbeImage,
  },
  {
    id: '3',
    bankName: 'Dashen Bank',
    accountName: 'AURA SHOP',
    accountNumber: '1122334455',
    routingNumber: '554433221',
    image: dashenImage,
  },
  {
    id: '4',
    bankName: 'Abysinnia Bank',
    accountName: 'AURA SHOP',
    accountNumber: '2233445566',
    routingNumber: '665544332',
    image: abysinniaImage,
  },
  {
    id: '5',
    bankName: 'Buna Bank',
    accountName: 'AURA SHOP',
    accountNumber: '3344556677',
    routingNumber: '776655443',
    image: bunaImage,
  },
  {
    id: '6',
    bankName: 'CBE',
    accountName: 'AURA SHOP',
    accountNumber: '4455667788',
    routingNumber: '887766554',
    image: commercialImage,
  },
];
