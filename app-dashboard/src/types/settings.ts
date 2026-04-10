export type PlatformSetting = {
  id: string;
  key: string;
  value: any;
  description: string;
  category: 'financial' | 'features' | 'content' | 'payouts' | 'security';
  updatedBy?: string;
  updatedAt?: string;
  isPublic: boolean;
};
