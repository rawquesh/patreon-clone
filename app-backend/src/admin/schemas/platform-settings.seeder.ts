import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformSetting, SettingCategory } from './platform-setting.schema';

export interface DefaultSetting {
  key: string;
  value: any;
  description: string;
  category: SettingCategory;
  isPublic: boolean;
}

@Injectable()
export class PlatformSettingsSeeder implements OnModuleInit {
  private readonly logger = new Logger(PlatformSettingsSeeder.name);

  constructor(
    @InjectModel(PlatformSetting.name)
    private settingModel: Model<PlatformSetting>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  async seedDefaults(): Promise<void> {
    const defaults: DefaultSetting[] = [
      {
        key: 'platformCommissionRate',
        value: 0.15,
        description: 'Platform commission rate as a decimal (0.15 = 15%). Applied to all creator earnings.',
        category: SettingCategory.FINANCIAL,
        isPublic: true,
      },
      {
        key: 'minimumPayoutAmount',
        value: 10.00,
        description: 'Minimum amount in USD required for a payout request',
        category: SettingCategory.PAYOUTS,
        isPublic: true,
      },
      {
        key: 'enableRegistrations',
        value: true,
        description: 'Allow new user sign-ups on the platform',
        category: SettingCategory.FEATURES,
        isPublic: true,
      },
      {
        key: 'enableNewCreators',
        value: true,
        description: 'Allow users to apply and become creators',
        category: SettingCategory.FEATURES,
        isPublic: true,
      },
      {
        key: 'maintenanceMode',
        value: false,
        description: 'Put the entire platform in maintenance mode',
        category: SettingCategory.FEATURES,
        isPublic: false,
      },
      {
        key: 'maxMediaUploadSize',
        value: 10485760,
        description: 'Maximum media file upload size in bytes (enter value in MB)',
        category: SettingCategory.CONTENT,
        isPublic: false,
      },
      {
        key: 'maxPostLength',
        value: 50000,
        description: 'Maximum number of characters allowed in post text content',
        category: SettingCategory.CONTENT,
        isPublic: false,
      },
      {
        key: 'requireCreatorApproval',
        value: true,
        description: 'New creator applications require admin approval before going live',
        category: SettingCategory.FEATURES,
        isPublic: false,
      },
    ];

    try {
      this.logger.log('Starting platform settings seeding...');
      for (const setting of defaults) {
        await this.settingModel.updateOne(
          { key: setting.key },
          {
            $set: {
              description: setting.description,
              category: setting.category,
              isPublic: setting.isPublic,
            },
            $setOnInsert: {
              key: setting.key,
              value: setting.value,
            },
          },
          { upsert: true },
        );
      }
      this.logger.log('Platform settings seeded successfully without overwriting user defaults.');
    } catch (error) {
      this.logger.error('Error seeding platform settings:', error.message);
    }
  }
}
