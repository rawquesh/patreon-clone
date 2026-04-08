import { SetMetadata } from '@nestjs/common';

/**
 * Marks an endpoint as publicly accessible (bypasses auth guard).
 * Usage: `@Public()`
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
