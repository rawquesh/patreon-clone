import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PayoutsController } from './payments.controller';
import { User, UserSchema } from '@/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
  ],
  controllers: [PayoutsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
