import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformSetting, SettingCategory } from '../schemas/platform-setting.schema';
import { UpdateSettingDto, BulkUpdateItemDto } from '../dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(PlatformSetting.name)
    private settingModel: Model<PlatformSetting>,
  ) {}

  async getAllSettings(category?: SettingCategory): Promise<any[]> {
    const filter = category ? { category } : {};
    return this.settingModel.find(filter).lean().exec();
  }

  async getSettingByKey(key: string): Promise<any> {
    const setting = await this.settingModel.findOne({ key }).lean().exec();
    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }
    return setting;
  }

  async updateSetting(
    key: string,
    dto: UpdateSettingDto,
    adminId: string,
  ): Promise<any> {
    const update: Record<string, any> = {};
    if (dto.value !== undefined) {
      update.value = dto.value;
    }
    if (dto.description !== undefined) {
      update.description = dto.description;
    }
    if (dto.isPublic !== undefined) {
      update.isPublic = dto.isPublic;
    }
    update.updatedBy = adminId;

    const setting = await this.settingModel
      .findOneAndUpdate({ key }, { $set: update }, { new: true, lean: true })
      .exec();
    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }
    return setting;
  }

  async bulkUpdateSettings(
    updates: BulkUpdateItemDto[],
    adminId: string,
  ): Promise<any[]> {
    const results: any[] = [];
    for (const item of updates) {
      const updated = await this.updateSetting(
        item.key,
        { value: item.value },
        adminId,
      );
      results.push(updated);
    }
    return results;
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const setting = await this.settingModel.findOne({ key }).lean().exec();
      return setting ? (setting.value as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
}
