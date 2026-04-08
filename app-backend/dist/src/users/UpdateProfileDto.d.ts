import { GenderPreference } from '@/database/schemas/user';
export declare class UpdateProfileDto {
    displayName?: string;
    email?: string;
    countryOfResidence?: string;
    gender?: string;
    genderPreference?: GenderPreference;
}
