import { Controller, Get } from '@nestjs/common';
import { SettingsService } from '@/admin/services/settings.service';

@Controller('platform-settings')
export class PlatformSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get all public platform settings for client apps (app-web, app-mobile).
   * This endpoint is public — no authentication required.
   */
  @Get()
  async getPublicSettings() {
    const allSettings = await this.settingsService.getAllSettings();
    // Return only public settings to non-authenticated clients
    const publicSettings = allSettings
      .filter((s: any) => s.isPublic)
      .map((s: any) => ({
        key: s.key,
        value: s.value,
        description: s.description,
        category: s.category,
      }));
    return publicSettings;
  }
}
