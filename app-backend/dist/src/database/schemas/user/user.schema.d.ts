import { Document } from 'mongoose';
import { AuthProvider, CreatorCategory, ContentVisibility, GenderPreference, CreatorStatus } from './enums';
export declare class User extends Document {
    email: string;
    password?: string;
    provider: AuthProvider;
    providerId?: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    countryOfResidence?: string;
    displayName?: string;
    updatedAy?: string;
    isCreator?: boolean;
    creatorUsername?: string;
    contentVisibleTo?: ContentVisibility;
    genderPreference?: GenderPreference;
    profileCover?: string;
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
    creatorNotifyOnNewMember: boolean;
    creatorNotifyOnComments: boolean;
    creatorNotifyOnDirectMessages: boolean;
    memberNotifyOnNewPost: boolean;
    memberNotifyOnDirectMessages: boolean;
    creatorStatus: CreatorStatus;
    creatorCategory?: CreatorCategory;
    introVideoUrl?: string;
    bio?: string;
    socialLinks?: Array<{
        platform: string;
        url: string;
    }>;
    isDeactivated?: boolean;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
