import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformSetting, PlatformSettingSchema, SettingCategory } from './platform-setting.schema';

export interface DefaultSetting {
  key: string;
  value: any;
  description: string;
  category: SettingCategory;
  isPublic: boolean;
}

@Injectable()
export class PlatformSettingsSeeder implements OnModuleInit {
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
        key: 'payoutSchedule',
        value: 'monthly',
        description: 'Payout schedule: "weekly", "biweekly", "monthly", or "quarterly"',
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
        key: 'defaultContentVisibility',
        value: 'public',
        description: 'Default post visibility: "public" or "members_only"',
        category: SettingCategory.CONTENT,
        isPublic: false,
      },
      {
        key: 'maxMediaUploadSize',
        value: 10485760,
        description: 'Maximum media file upload size in bytes (default: 10MB)',
        category: SettingCategory.CONTENT,
        isPublic: false,
      },
      {
        key: 'maxPostLength',
        value: 50000,
        description: 'Maximum text content length for posts',
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

    for (const setting of defaults) {
      await this.settingModel.findOneAndUpdate(
        { key: setting.key },
        {
          $setOnInsert: {
            key: setting.key,
            value: setting.value,
            description: setting.description,
            category: setting.category,
            isPublic: setting.isPublic,
          },
        },
        { upsert: true, lean: true },
      );
    }
  }
}
