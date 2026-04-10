import { SetMetadata } from '@nestjs/common';

/**
 * Marks an endpoint as exempt from maintenance mode.
 * Admin routes use this so the dashboard remains accessible during maintenance.
 * Usage: `@SkipMaintenance()`
 */
export const SKIP_MAINTENANCE_KEY = 'skipMaintenance';
export const SkipMaintenance = () => SetMetadata(SKIP_MAINTENANCE_KEY, true);