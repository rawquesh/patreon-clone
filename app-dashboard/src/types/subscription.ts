export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

export type Subscription = {
  id: string;
  member: {
    name: string;
    email: string;
    avatar: string;
  };
  creator: {
    name: string;
  };
  plan: string;
  status: SubscriptionStatus;
  amount: number;
  startDate: string;
  nextBilling: string;
};
