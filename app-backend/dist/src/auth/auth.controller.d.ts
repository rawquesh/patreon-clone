import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, RegisterDto, GoogleTokenDto } from './auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    getCurrentUser(req: any): Promise<{
        email: string;
        provider: import("../database").AuthProvider;
        providerId?: string;
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
        countryOfResidence?: string;
        displayName?: string;
        updatedAy?: string;
        isCreator?: boolean;
        creatorUsername?: string;
        contentVisibleTo?: import("../database").ContentVisibility;
        genderPreference?: import("../database").GenderPreference;
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
        creatorStatus: import("../database").CreatorStatus;
        creatorCategory?: import("../database").CreatorCategory;
        introVideoUrl?: string;
        bio?: string;
        socialLinks?: Array<{
            platform: string;
            url: string;
        }>;
        isDeactivated?: boolean;
        _id: import("mongoose").Types.ObjectId;
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
    signup(signUpDto: SignUpDto): Promise<any>;
    login(loginDto: LoginDto): Promise<any>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any, res: any): Promise<void>;
    googleMobileLogin(googleTokenDto: GoogleTokenDto): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            firstName: string;
            lastName: string;
        };
        token: string;
    }>;
    checkUsername(username: string): Promise<{
        isInUse: boolean;
    }>;
    checkEmail(email: string): Promise<{
        isInUse: boolean;
        passwordSet: boolean;
    }>;
    register(registerDto: RegisterDto): Promise<import("./auth.service").AuthResponse>;
}
