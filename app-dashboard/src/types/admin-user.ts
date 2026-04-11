export type AdminUser = {
  id: string;
  email: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    displayName?: string;
    email?: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
  };
};
