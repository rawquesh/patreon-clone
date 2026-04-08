import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Chat,
  ChatSchema,
  ChatParticipant,
  ChatParticipantSchema,
  Message,
  MessageSchema,
} from '@/database/schemas/chat';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from '@/database/schemas/user';
import { Membership, MembershipSchema } from '@/database/schemas/membership';
import {
  Subscription,
  SubscriptionSchema,
} from '@/database/schemas/subscription';
import { S3Module } from '@/s3/s3.module';
import { ChatUploadsController } from './chat-uploads.controller';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: ChatParticipant.name, schema: ChatParticipantSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    S3Module,
    NotificationsModule,
  ],
  controllers: [ChatController, ChatUploadsController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
