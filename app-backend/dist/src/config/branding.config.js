"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branding = void 0;
exports.branding = {
    appName: 'patreon-clone',
    companyName: 'patreon-clone Inc.',
    supportEmail: 'support@patreon-clone.example.com',
    websiteUrl: 'https://patreon-clone.example.com',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    urls: {
        terms: 'https://patreon-clone.example.com/terms',
        privacy: 'https://patreon-clone.example.com/privacy',
        help: 'https://patreon-clone.example.com/help',
    },
    assets: {
        logo: process.env.BRAND_LOGO_URL || 'https://cdn.patreon-clone.example.com/logos/logo.png',
        emailHeader: process.env.BRAND_EMAIL_HEADER_URL ||
            'https://cdn.patreon-clone.example.com/logos/email-header.png',
        emailFooter: process.env.BRAND_EMAIL_FOOTER_URL ||
            'https://cdn.patreon-clone.example.com/logos/email-footer.png',
        favicon: process.env.BRAND_FAVICON_URL ||
            'https://cdn.patreon-clone.example.com/logos/favicon.ico',
    },
    social: {
        twitter: 'https://twitter.com/patreon-clone',
        instagram: 'https://instagram.com/patreon-clone',
        facebook: 'https://facebook.com/patreon-clone',
    },
    email: {
        senderName: 'patreon-clone',
        senderAddress: 'no-reply@patreon-clone.example.com',
    },
    corsOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:3001'],
    google: {
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    },
    video: {
        youtubeThumbnailBase: 'https://img.youtube.com/vi',
    },
};
//# sourceMappingURL=branding.config.js.map