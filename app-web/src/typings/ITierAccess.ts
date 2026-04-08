export interface TierAccess {
  _id: string;
  creator: string;
  name: string;
  description: string;
  monthlyRate: number;
  coverImage: string;
  isActive: boolean;
  benefits: any[];
  subscriberCount: number;
  totalEarnings: number;
  stripeProductId: string;
  stripePriceId: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
