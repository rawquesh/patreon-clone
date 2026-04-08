import { MembershipsModule } from '@/memberships/memberships.module';
import { PaymentsModule } from '@/payments/payments.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeWebhookController } from './stripe-webhooks.controller';
import { ChatModule } from '@/chat/chat.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    MembershipsModule,
    PaymentsModule,
    ConfigModule,
    ChatModule,
    UsersModule,
  ],
  controllers: [StripeWebhookController],
})
export class WebhooksModule {}
