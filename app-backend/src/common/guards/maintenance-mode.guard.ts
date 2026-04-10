import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SettingsService } from '@/admin/services/settings.service';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { SKIP_MAINTENANCE_KEY } from '@/common/decorators/skip-maintenance.decorator';

@Injectable()
export class MaintenanceModeGuard implements CanActivate {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isMaintenanceMode = await this.settingsService.get<boolean>(
        'maintenanceMode',
        false,
      );

      if (!isMaintenanceMode) {
        return true;
      }

      // Allow public endpoints during maintenance mode
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) {
        return true;
      }

      // Allow endpoints marked @SkipMaintenance() (e.g. admin routes)
      const skipMaintenance = this.reflector.getAllAndOverride<boolean>(SKIP_MAINTENANCE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (skipMaintenance) {
        return true;
      }

      throw new ServiceUnavailableException(
        'The platform is currently under maintenance. Please try again later.',
      );
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      // If settings service fails, allow the request
      return true;
    }
  }
}
