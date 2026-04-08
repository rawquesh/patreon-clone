/**
 * Business configuration -- platform-level rules, limits, and constants.
 * These are buyer-editable business parameters (not secrets).
 * Secrets belong in .env, not here.
 */
export const business = {
  /**
   * Platform fee deducted from each creator payout.
   * Example: 15 means the platform keeps 15%, creator receives 85%.
   */
  platformFeePercent: 15,

  /** Default currency for all payment operations (ISO 4217 code). */
  currency: 'usd',

  /** Minimum payout amount in the default currency. */
  payoutMinAmount: 1,

  /** Stripe payout schedule for creator Connect accounts. */
  payoutSchedule: 'manual' as const, // 'daily' | 'weekly' | 'manual'

  /** Default membership created automatically for new creators. */
  defaultFreeMembership: {
    name: 'Free Membership',
    description: 'Access to free content from this creator',
    benefits: ['Access to public posts', 'Join the community'],
  },

  /**
   * Creator content categories.
   * Edit or replace this list to match your marketplace niche.
   */
  creatorCategories: [
    'Music & Art',
    'Entertainment & Comedy',
    'History & Literacy',
    'General Education',
    'Food & Cooking',
    'Lifestyle & Wellness',
    'Travel & Israel',
    'Business & Finance',
    'Relationships & Parenting',
    'Torah Study',
    'Fitness & Health',
  ] as const,

  /** File and content limits. */
  limits: {
    maxPostTitleLength: 200,
    maxBioLength: 1000,
    maxFileUploadSizeMB: 100,
    profilePhotoMaxSizeMB: 5,
    coverImageMaxSizeMB: 5,
    chatAttachmentMaxSizeMB: 10,
  },

  /** Subscription and trial configuration. */
  subscription: {
    /** Maximum free trial duration in days. */
    trialMaxDays: 14,
    /** Grace period after payment failure before subscription is marked expired. */
    gracePeriodDays: 7,
  },

  /**
   * S3 storage bucket names.
   * These should be overridden by S3_BUCKET_NAME, S3_COLLECTIONS_BUCKET, etc. in .env.
   */
  s3: {
    defaultBucket: process.env.S3_BUCKET_NAME || 'patreon-clone-assets',
    collectionsBucket:
      process.env.S3_COLLECTIONS_BUCKET || 'patreon-clone-collections',
    testBucket: process.env.S3_TEST_BUCKET || 'patreon-clone-test-cover',
  },

  /** Server configuration. */
  server: {
    port: parseInt(process.env.PORT || '8080', 10),
    jwtExpiresIn: '1d',
  },
} as const;
