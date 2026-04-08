export type CreatorStatus = 'DRAFT' | 'ONBOARDING' | 'PUBLISHED' | 'ARCHIVED';

export type Creator = {
  _id: string;
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  profilePicture?: string;
  profileCover?: string;
  creatorUsername?: string;
  creatorStatus: CreatorStatus;
  creatorHeadline?: string;
  creatorCategory?: string;
  bio?: string;
  hasCompletedStripeOnboarding: boolean;
  stripeConnectAccountId?: string;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  isDeactivated?: boolean;
  createdAt: string;
  // enriched fields
  subscriberCount?: number;
  postCount?: number;
};

export type CreatorDetail = Creator & {
  introVideoUrl?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  countryOfResidence?: string;
  gender?: string;
  creatorNotifyOnNewMember: boolean;
  creatorNotifyOnComments: boolean;
  creatorNotifyOnDirectMessages: boolean;
  memberNotifyOnNewPost: boolean;
  memberNotifyOnDirectMessages: boolean;
  totalSubscribers?: number;
  recentSubscriptions?: Array<{
    id: string;
    status: string;
    monthlyRate: number;
    createdAt: string;
    subscriber?: {
      id: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      profilePicture?: string;
    };
    membership?: {
      id: string;
      name: string;
      monthlyRate: number;
    };
  }>;
};
