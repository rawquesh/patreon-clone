/**
 * Branding configuration -- all client-facing business identity in one place.
 * Edit this file to rebrand the product for marketplace distribution.
 * Secrets (API keys, passwords, connection strings) belong in .env, NOT here.
 */
export const branding = {
  appName: 'Kejilah',
  companyName: 'Kejilah Inc.',
  supportEmail: 'support@kejilah.co',
  websiteUrl: 'https://kejilah.co',
  /**
   * Frontend URL used for OAuth redirects and Stripe callback URLs.
   * Can be overridden by FRONTEND_URL environment variable.
   */
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Public URLs used in email templates, docs, etc.
  urls: {
    terms: 'https://kejilah.co/terms',
    privacy: 'https://kejilah.co/privacy',
    help: 'https://kejilah.co/help',
  },

  // Logo and public asset references (CDN or uploaded)
  assets: {
    logo: process.env.BRAND_LOGO_URL || 'https://cdn.kejilah.co/logos/logo.png',
    emailHeader:
      process.env.BRAND_EMAIL_HEADER_URL ||
      'https://cdn.kejilah.co/logos/email-header.png',
    emailFooter:
      process.env.BRAND_EMAIL_FOOTER_URL ||
      'https://cdn.kejilah.co/logos/email-footer.png',
    favicon:
      process.env.BRAND_FAVICON_URL ||
      'https://cdn.kejilah.co/logos/favicon.ico',
  },

  // Social media links
  social: {
    twitter: 'https://twitter.com/kejilah',
    instagram: 'https://instagram.com/kejilah',
    facebook: 'https://facebook.com/kejilah',
  },

  // Email sender identity
  email: {
    senderName: 'Kejilah',
    senderAddress: 'no-reply@kejilah.co',
  },

  // CORS allowed origins (comma-separated in env: ALLOWED_ORIGINS)
  // Defaults are for local development only.
  corsOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
} as const;
