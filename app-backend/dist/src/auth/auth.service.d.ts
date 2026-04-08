import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, AuthProvider } from '@/database/schemas/user';
import { SignUpDto, LoginDto, RegisterDto } from './auth.dto';
import { PaymentsService } from '@/payments/payments.service';
export interface AuthResponse {
    user: User;
    token: string;
}
export declare class AuthService {
    private userModel;
    private jwtService;
    private paymentsService;
    private readonly logger;
    constructor(userModel: Model<User>, jwtService: JwtService, paymentsService: PaymentsService);
    verifyGoogleAccessToken(accessToken: string): Promise<{
        user: {
            id: unknown;
            email: string;
            firstName: string;
            lastName: string;
        };
        token: string;
    }>;
    signup(signUpDto: SignUpDto): Promise<any>;
    login(loginDto: LoginDto): Promise<any>;
    validateUser(email: string, password: string): Promise<any>;
    googleLogin(profile: any): Promise<{
        user: {
            id: unknown;
            email: string;
            firstName: string;
            lastName: string;
        };
        token: string;
    }>;
    private generateToken;
    getCurrentUser(userId: string): Promise<{
        email: string;
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
        contentVisibleTo?: import("@/database/schemas/user").ContentVisibility;
        genderPreference?: import("@/database/schemas/user").GenderPreference;
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
        creatorStatus: import("@/database/schemas/user").CreatorStatus;
        creatorCategory?: import("@/database/schemas/user").CreatorCategory;
        introVideoUrl?: string;
        bio?: string;
        socialLinks?: Array<{
            platform: string;
            url: string;
        }>;
        _id: unknown;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    isUsernameInUse(displayName: string): Promise<boolean>;
    isEmailInUse(email: string): Promise<{
        isInUse: boolean;
        passwordSet: boolean;
    }>;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
}
