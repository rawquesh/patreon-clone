import { GenderPreference } from '@/database/schemas/user/enums';
export interface RequestingUser {
    userId: string;
    gender?: string;
    genderPreference?: GenderPreference;
}
