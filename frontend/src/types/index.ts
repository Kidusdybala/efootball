export interface CoinPackage {
  id: string;
  type: 'coin';
  title: string;
  description: string;
  price: number;
  amount: number;
  images: string[];
  playerImage?: string;
  region?: string;
  regionImage?: string;
  featured?: boolean;
  discount?: boolean;
  discountPercentage?: number;
  discountDays?: number;
  discountEndDate?: string;
}

export interface Account {
  id: string;
  type: 'account';
  title: string;
  description: string;
  price: number;
  rating: number;
  level: number;
  coins: number;
  players: number;
  images: string[];
  featured?: boolean;
  discount?: boolean;
}

export interface Team {
  id: string;
  type: 'team';
  title: string;
  description: string;
  price: number;
  formation: string;
  rating: number;
  players: string[];
  images: string[];
  featured?: boolean;
  discount?: boolean;
}

export interface Order {
  _id?: string;
  id?: string;
  orderId: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  itemType?: 'coin' | 'account' | 'team';
  itemId?: string;
  itemTitle?: string;
  item?: string;
  amount?: number;
  quantity?: number;
  totalPrice: number;
  status: 'Pending' | 'Paid' | 'Delivered';
  createdAt: Date;
  receiptUrl?: string;
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  pointsBalance?: number;
  totalOrders?: number;
  totalSpent?: number;
  telegramId?: string;
}

export interface PointTransaction {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  order?: string | { _id: string; orderId: string };
  pointsEarned: number;
  reason: string;
  createdAt: string;
}

export interface RewardMilestone {
  _id: string;
  pointsRequired: number;
  rewardCoins: number;
  label: string;
  createdAt: string;
}

export interface AdminReward {
  _id: string;
  user: string;
  admin: string;
  coinsRewarded: number;
  note?: string;
  createdAt: string;
}

export interface PaymentMethod {
  _id?: string;
  id?: string;
  name: string;
  accountName: string;
  accountNumber?: string;
  image: string;
}

export interface Listing {
  _id: string;
  type: 'coin' | 'account' | 'team';
  title: string;
  description: string;
  price: number;
  images: string[];
  playerImage?: string;
  region?: string;
  regionImage?: string;
  amount?: number;
  level?: number;
  rating?: number;
  formation?: string;
  players?: string[] | number;
  coins?: number;
  featured?: boolean;
  discount?: boolean;
  discountPercentage?: number;
  discountDays?: number;
  discountEndDate?: string;
  createdAt?: string;
}

export type TabType = 'coins' | 'accounts';
