export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type Payout = {
  id: string;
  amount: number;
  status: PayoutStatus;
  stripeTransferId?: string;
  completedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt?: string;
  creator: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    availableBalance?: number;
  };
  // convenience fields used by pages
  requestDate?: string;
  processedDate?: string;
};

export type PayoutDetail = Payout & {
  creator?: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    availableBalance?: number;
    pendingBalance?: number;
    lifetimeEarnings?: number;
    hasStripeConnect?: boolean;
  };
};

export type PayoutStats = {
  pendingCount: number;
  pendingAmount: number;
  paidThisMonth: number;
  paidThisMonthAmount: number;
  totalPaid: number;
  rejectedCount: number;
};
