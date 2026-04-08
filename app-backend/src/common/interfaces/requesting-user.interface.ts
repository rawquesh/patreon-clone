import { GenderPreference } from '@/database/schemas/user/enums';

/**
 * Represents the requesting user when fetching creator lists or feeds.
 * Used for gender-based content filtering.
 */
export interface RequestingUser {
  userId: string;
  gender?: string;
  genderPreference?: GenderPreference;
}
