export declare class SignUpDto {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: Gender;
}
export declare class GoogleTokenDto {
    accessToken: string;
}
export declare class GoogleIdTokenDto {
    idToken: string;
}
