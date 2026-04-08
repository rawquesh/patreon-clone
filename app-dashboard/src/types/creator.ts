export type CreatorStatus = 'approved' | 'pending' | 'suspended';

export type Creator = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: CreatorStatus;
  joinedDate: string;
  stripeOnboarded: boolean;
};
