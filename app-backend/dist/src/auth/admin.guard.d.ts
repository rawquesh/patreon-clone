import { User } from '@/database/schemas/user';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Model } from 'mongoose';
export declare class AdminGuard implements CanActivate {
    private userModel;
    constructor(userModel: Model<User>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
