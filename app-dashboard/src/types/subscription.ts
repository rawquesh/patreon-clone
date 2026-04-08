export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export type Subscription = {
  id: string;
  status: SubscriptionStatus;
  monthlyRate: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt?: string;
  stripeSubscriptionId?: string;
  isTrial?: boolean;
  hasDiscount?: boolean;
  discountData?: {
    discountId?: string;
    discountCode?: string;
    originalPrice?: number;
    discountedPrice?: number;
  };
  giftData?: {
    giftId?: string;
    giftCode?: string;
    originalPrice?: number;
    trialDurationDays?: number;
  };
  createdAt: string;
  member: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  creator: {
    id: string;
    name: string;
    username?: string;
  };
  membership: {
    id: string;
    name: string;
    monthlyRate: number;
  };
  // convenience fields used by pages
  plan?: string;
  amount?: number;
  nextBilling?: string;
  startDate?: string;
};

export type SubscriptionDetail = Subscription & {
  plan?: string;
  nextBilling?: string;
  startDate?: string;
};

export type SubscriptionStats = {
  totalActive: number;
  totalCancelled: number;
  totalExpired: number;
  totalTrial: number;
  totalSubscriptions: number;
  mrr: number;
  arpu: number;
  churnRate: number;
};
