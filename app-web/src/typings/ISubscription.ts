import { IGift, IDiscount } from "./IDiscount";

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export interface ISubscription {
  _id: string;
  subscriber: string;
  creator: Creator;
  membership: Membership;
  monthlyRate: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeSubscriptionId: string;
  isTrial: boolean;
  hasDiscount: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  daysUntilRenewal: number;
  nextBillingAmount: number;
}

export interface Creator {
  _id: string;
  profilePicture: string;
  displayName: string;
  creatorUsername: string;
}

export interface Membership {
  _id: string;
  creator: string;
  name: string;
  description: string;
  monthlyRate: number;
  coverImage: string;
  isActive: boolean;
  benefits: string[];
  subscriberCount: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  stripePriceId: string;
  stripeProductId: string;
}

export interface IMembership {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  monthlyRate: number;
  coverImage?: string;
  isActive: boolean;
  benefits: string[];
  subscriberCount: number;
  totalEarnings: number;
  isLimited?: boolean;
  seatsLeft?: number;
  isFeatured?: boolean;
  yearlyPrice?: number;
  createdAt: string;
  updatedAt: string;
  monthlyPrice: number;
  _id: string;
  isTrial?: boolean;
  trialDurationDays?: number;
}

export interface SubscriptionResponse {
  subscription: ISubscription;
  checkoutUrl?: string;
}

export interface SubscriptionsResponse {
  subscriptions: ISubscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ICheckSubscriptionResponse {
  isSubscribed: boolean;
  subscription?: ISubscription;
}

export interface IPromotionValidationResponse {
  isValid: boolean;
  message: string;
  promotion?: IDiscount | IGift;
  discountedPrice?: number;
  originalPrice?: number;
}

export interface IPromotionRedemptionResponse {
  success: boolean;
  message: string;
  subscription?: ISubscription;
  checkoutUrl?: string;
}

export interface SubscriptionFilterParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
}
