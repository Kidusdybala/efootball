export interface CoinPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  amount: number;
  image: string;
  featured?: boolean;
  discount?: boolean;
}

export interface Account {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  level: number;
  coins: number;
  players: number;
  image: string;
  featured?: boolean;
  discount?: boolean;
}

export interface Team {
  id: string;
  title: string;
  description: string;
  price: number;
  formation: string;
  rating: number;
  players: string[];
  image: string;
  featured?: boolean;
  discount?: boolean;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  itemType: 'coin' | 'account' | 'team';
  itemId: string;
  itemTitle: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'delivered';
  createdAt: Date;
  receiptUrl?: string;
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
}

export type TabType = 'coins' | 'Accounts';
