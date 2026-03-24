export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  balance: number;
  totalEarned: number;
  createdAt: any;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  payout: number;
  link: string;
  category: string;
  status: 'active' | 'paused';
  createdAt: any;
}

export interface Lead {
  id: string;
  userId: string;
  offerId: string;
  offerTitle: string;
  payout: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: string;
  details: string;
  status: 'pending' | 'paid' | 'rejected';
  createdAt: any;
}
