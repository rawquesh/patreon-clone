import {
  ContentVisibility,
  GenderPreference,
} from '@/database/schemas/user/enums';
import { RequestingUser } from '@/common/interfaces';

/**
 * Builds MongoDB filter conditions for gender-based content filtering.
 * Shared by users, search, and home services.
 *
 * Logic:
 * 1. If the requesting user has a gender preference (male/female/both), show only creators of that gender.
 * 2. If the requesting user has a gender, show creators whose content is visible to that gender (or both).
 * 3. If no gender is set on the requesting user, default to showing "both" content only.
 */
export function addGenderFilters(
  baseFilter: Record<string, any>,
  requestingUser?: RequestingUser,
): Record<string, any> {
  const filter = { ...baseFilter };
  const genderConditions: Record<string, any>[] = [];

  // Condition 1: Filter by creator gender based on requesting user's preference
  if (
    requestingUser?.genderPreference &&
    requestingUser.genderPreference !== GenderPreference.BOTH
  ) {
    genderConditions.push({
      $or: [
        { gender: 'male' },
        { gender: 'Male' },
        { gender: 'female' },
        { gender: 'Female' },
      ].filter((f) =>
        requestingUser.genderPreference === GenderPreference.MALE
          ? f.gender === 'male' || f.gender === 'Male'
          : f.gender === 'female' || f.gender === 'Female',
      ),
    });
  }

  // Condition 2: Filter by content visibility matching requesting user's gender
  if (requestingUser?.gender) {
    const userGenderLower = requestingUser.gender.toLowerCase();
    if (userGenderLower === 'male' || userGenderLower === 'female') {
      genderConditions.push({
        $or: [
          { contentVisibleTo: ContentVisibility.BOTH },
          { contentVisibleTo: userGenderLower as ContentVisibility },
        ],
      });
    } else {
      genderConditions.push({ contentVisibleTo: ContentVisibility.BOTH });
    }
  } else {
    // No gender set: default to showing "both" content only
    genderConditions.push({ contentVisibleTo: ContentVisibility.BOTH });
  }

  if (genderConditions.length > 0) {
    if (filter.$and) {
      filter.$and = Array.isArray(filter.$and)
        ? [...filter.$and, ...genderConditions]
        : [filter.$and, ...genderConditions];
    } else {
      filter.$and = genderConditions;
    }
  }

  return filter;
}
