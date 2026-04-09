export declare const business: {
    readonly platformFeePercent: 15;
    readonly currency: "usd";
    readonly payoutMinAmount: 1;
    readonly payoutSchedule: "manual";
    readonly defaultFreeMembership: {
        readonly name: "Free Membership";
        readonly description: "Access to free content from this creator";
        readonly benefits: readonly ["Access to public posts", "Join the community"];
    };
    readonly creatorCategories: readonly ["Music & Art", "Entertainment & Comedy", "History & Literacy", "General Education", "Food & Cooking", "Lifestyle & Wellness", "Travel & Israel", "Business & Finance", "Relationships & Parenting", "Torah Study", "Fitness & Health"];
    readonly limits: {
        readonly maxPostTitleLength: 200;
        readonly maxBioLength: 1000;
        readonly maxFileUploadSizeMB: 100;
        readonly profilePhotoMaxSizeMB: 5;
        readonly coverImageMaxSizeMB: 5;
        readonly chatAttachmentMaxSizeMB: 10;
    };
    readonly subscription: {
        readonly trialMaxDays: 14;
        readonly gracePeriodDays: 7;
    };
    readonly s3: {
        readonly baseUrl: string;
        readonly defaultBucket: string;
        readonly collectionsBucket: string;
        readonly testBucket: string;
    };
    readonly server: {
        readonly port: number;
        readonly jwtExpiresIn: "1d";
    };
};
