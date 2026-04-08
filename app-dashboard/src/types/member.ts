export type MemberStatus = 'active' | 'inactive';

export type MemberSubscriptionStatus = 'active' | 'canceled' | 'past_due';

export type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: MemberStatus;
  joinedDate: string;
  subscription: {
    plan: string;
    status: MemberSubscriptionStatus;
  };
};
