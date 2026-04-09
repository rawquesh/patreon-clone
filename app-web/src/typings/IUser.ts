// GenderPreference is defined in auth.provider.tsx and app/settings/page.tsx

export type CreatorStatus = "DRAFT" | "ONBOARDING" | "PUBLISHED";

export enum GenderPreference {
  BOTH = "both",
  MALE = "male",
  FEMALE = "female",
}

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  provider: string;
  profilePicture?: string;
  countryOfResidence?: string;
  isCreator?: boolean;
  profileCover?: string;
  creatorUsername?: string;
  creatorHeadline?: string;
  gender?: string;
  stripeCustomerId?: string;
  stripeConnectAccountId?: string;
  hasCompletedStripeOnboarding: boolean;
  stripeOnboardingUrl?: string;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  isAdmin?: boolean;
  creatorStatus?: CreatorStatus;
  creatorCategory?: CreatorCategory;
  contentVisibleTo?: ContentVisibility;
  genderPreference?: GenderPreference;
}

export enum CreatorCategory {
  MUSIC_ART = "Music & Art",
  ENTERTAINMENT_COMEDY = "Entertainment & Comedy",
  HISTORY_LITERACY = "History & Literacy",
  GENERAL_EDUCATION = "General Education",
  FOOD_COOKING = "Food & Cooking",
  LIFESTYLE_WELLNESS = "Lifestyle & Wellness",
  TRAVEL_ADVENTURE = "Travel & Adventure",
  BUSINESS_FINANCE = "Business & Finance",
  RELATIONSHIPS_PARENTING = "Relationships & Parenting",
  EDUCATION_LEARNING = "Education & Learning",
  FITNESS_HEALTH = "Fitness & Health",
}

export enum ContentVisibility {
  BOTH = "both",
  MALE = "male",
  FEMALE = "female",
}
