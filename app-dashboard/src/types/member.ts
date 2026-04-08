export type MemberStatus = 'active' | 'inactive';

export type MemberSubscriptionStatus = 'active' | 'canceled' | 'expired';

export type Member = {
  _id: string;
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  profilePicture?: string;
  countryOfResidence?: string;
  createdAt: string;
  isDeactivated?: boolean;
  stripeCustomerId?: string;
  subscription?: {
    plan: string;
    status: string;
    amount: number;
    creator?: string;
  };
};

export type MemberDetail = Member & {
  subscriptions?: Array<{
    id: string;
    status: string;
    monthlyRate: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    createdAt: string;
    creator?: {
      id: string;
      displayName?: string;
      creatorUsername?: string;
      profilePicture?: string;
    };
    membership?: {
      id: string;
      name: string;
      monthlyRate: number;
      description?: string;
    };
  }>;
};
