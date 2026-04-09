/**
 * Branding configuration -- all client-facing business identity in one place.
 * Edit this file to rebrand the product for marketplace distribution.
 * Secrets (API keys, passwords, connection strings) belong in .env, NOT here.
 */
export const branding = {
  appName: 'patreon-clone',
  companyName: 'patreon-clone Inc.',
  supportEmail: 'support@patreon-clone.example.com',
  websiteUrl: 'https://patreon-clone.example.com',
  /**
   * Frontend URL used for OAuth redirects and Stripe callback URLs.
   * Can be overridden by FRONTEND_URL environment variable.
   */
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Public URLs used in email templates, docs, etc.
  urls: {
    terms: 'https://patreon-clone.example.com/terms',
    privacy: 'https://patreon-clone.example.com/privacy',
    help: 'https://patreon-clone.example.com/help',
  },

  // Logo and public asset references (CDN or uploaded)
  assets: {
    logo: process.env.BRAND_LOGO_URL || 'https://cdn.patreon-clone.example.com/logos/logo.png',
    emailHeader:
      process.env.BRAND_EMAIL_HEADER_URL ||
      'https://cdn.patreon-clone.example.com/logos/email-header.png',
    emailFooter:
      process.env.BRAND_EMAIL_FOOTER_URL ||
      'https://cdn.patreon-clone.example.com/logos/email-footer.png',
    favicon:
      process.env.BRAND_FAVICON_URL ||
      'https://cdn.patreon-clone.example.com/logos/favicon.ico',
  },

  // Social media links
  social: {
    twitter: 'https://twitter.com/patreon-clone',
    instagram: 'https://instagram.com/patreon-clone',
    facebook: 'https://facebook.com/patreon-clone',
  },

  // Email sender identity
  email: {
    senderName: 'patreon-clone',
    senderAddress: 'no-reply@patreon-clone.example.com',
  },

  // CORS allowed origins (comma-separated in env: ALLOWED_ORIGINS)
  // Defaults are for local development only.
  corsOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],

  // Third-party API URLs
  google: {
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  },

  // Video platform URLs
  video: {
    youtubeThumbnailBase: 'https://img.youtube.com/vi',
  },
} as const;
