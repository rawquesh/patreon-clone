import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerStatusController } from './server-status.controller';
import { ServerStatusService } from './server-status.service';
import { User, UserSchema } from '@/database/schemas/user';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ServerStatusController],
  providers: [ServerStatusService],
  exports: [ServerStatusService],
})
export class ServerStatusModule {}
