import { Model } from 'mongoose';
import { Subscription } from '@/database/schemas/subscription';
import { User } from '@/database/schemas/user';
import { Membership } from '@/database/schemas/membership';
import { GetMembersDto, MembersResponseDto } from './members.dto';
export declare class MembersService {
    private subscriptionModel;
    private userModel;
    private membershipModel;
    constructor(subscriptionModel: Model<Subscription>, userModel: Model<User>, membershipModel: Model<Membership>);
    getMembers(creatorId: string, filters: GetMembersDto): Promise<MembersResponseDto>;
}
