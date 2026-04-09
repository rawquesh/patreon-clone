"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.business = void 0;
exports.business = {
    platformFeePercent: 15,
    currency: 'usd',
    payoutMinAmount: 1,
    payoutSchedule: 'manual',
    defaultFreeMembership: {
        name: 'Free Membership',
        description: 'Access to free content from this creator',
        benefits: ['Access to public posts', 'Join the community'],
    },
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
    ],
    limits: {
        maxPostTitleLength: 200,
        maxBioLength: 1000,
        maxFileUploadSizeMB: 100,
        profilePhotoMaxSizeMB: 5,
        coverImageMaxSizeMB: 5,
        chatAttachmentMaxSizeMB: 10,
    },
    subscription: {
        trialMaxDays: 14,
        gracePeriodDays: 7,
    },
    s3: {
        baseUrl: process.env.S3_ASSETS_BASE_URL || 'https://patreon-clone-assets.s3.eu-north-1.amazonaws.com',
        defaultBucket: process.env.S3_BUCKET_NAME || 'patreon-clone-assets',
        collectionsBucket: process.env.S3_COLLECTIONS_BUCKET || 'patreon-clone-collections',
        testBucket: process.env.S3_TEST_BUCKET || 'patreon-clone-test-cover',
    },
    server: {
        port: parseInt(process.env.PORT || '8080', 10),
        jwtExpiresIn: '1d',
    },
};
//# sourceMappingURL=business.config.js.map