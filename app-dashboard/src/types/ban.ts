export type BanType = 'account' | 'ip' | 'email';
export type BanStatus = 'active' | 'expired' | 'lifted';

export type Ban = {
  id: string;
  userId?: string;
  type: BanType;
  reason: string;
  adminNotes?: string;
  bannedBy: {
    id: string;
    displayName?: string;
    email?: string;
  };
  expiresAt?: string;
  status: BanStatus;
  liftedBy?: {
    id: string;
    displayName?: string;
    email?: string;
  };
  liftedAt?: string;
  createdAt: string;
};

export type BanStats = {
  activeBans: number;
  expiredBans: number;
  byType: {
    account: number;
    ip: number;
    email: number;
  };
};
