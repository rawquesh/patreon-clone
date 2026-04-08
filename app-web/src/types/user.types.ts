export interface SocialLinkDto {
  platform: string;
  url: string;
  icon?: string; // Keep icon optional as in AboutData
}

// Define the UpdateSocialLinksDto based on the backend DTO
export interface UpdateSocialLinksDto {
  socialLinks: SocialLinkDto[];
}
