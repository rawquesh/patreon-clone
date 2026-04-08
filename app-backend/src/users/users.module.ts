// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from '@/database/schemas/user';
import { S3Module } from '@/s3/s3.module';
import { PaymentsModule } from '@/payments/payments.module';
import { MembershipsModule } from '@/memberships/memberships.module';
import { Membership, MembershipSchema } from '@/database/schemas/membership';
import {
  Subscription,
  SubscriptionSchema,
} from '@/database/schemas/subscription';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: Membership.name,
        schema: MembershipSchema,
      },
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
    ]),
    S3Module,
    PaymentsModule,
    MembershipsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
