import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from '@/admin/services/settings.service';
import { PlatformSetting, PlatformSettingSchema } from '@/admin/schemas/platform-setting.schema';
import { PlatformSettingsController } from './platform-settings.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlatformSetting.name, schema: PlatformSettingSchema },
    ]),
  ],
  controllers: [PlatformSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class PlatformSettingsModule {}
