/**
 * Re-exports all schemas from the new organized directory structure.
 * Modules should import from individual sub-paths (e.g., @/database/schemas/user)
 * rather than from this barrel file, for better tree-shaking and clarity.
 */
export * from './user';
export * from './post';
export * from './membership';
export * from './subscription';
export * from './chat';
export * from './notification';
export * from './promotion';
export * from './analytics';
export * from './engagement';
export * from './payout';
export * from './report';
export * from './device';
