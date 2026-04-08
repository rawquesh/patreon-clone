"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branding = void 0;
exports.branding = {
    appName: 'Kejilah',
    companyName: 'Kejilah Inc.',
    supportEmail: 'support@kejilah.co',
    websiteUrl: 'https://kejilah.co',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    urls: {
        terms: 'https://kejilah.co/terms',
        privacy: 'https://kejilah.co/privacy',
        help: 'https://kejilah.co/help',
    },
    assets: {
        logo: process.env.BRAND_LOGO_URL || 'https://cdn.kejilah.co/logos/logo.png',
        emailHeader: process.env.BRAND_EMAIL_HEADER_URL ||
            'https://cdn.kejilah.co/logos/email-header.png',
        emailFooter: process.env.BRAND_EMAIL_FOOTER_URL ||
            'https://cdn.kejilah.co/logos/email-footer.png',
        favicon: process.env.BRAND_FAVICON_URL ||
            'https://cdn.kejilah.co/logos/favicon.ico',
    },
    social: {
        twitter: 'https://twitter.com/kejilah',
        instagram: 'https://instagram.com/kejilah',
        facebook: 'https://facebook.com/kejilah',
    },
    email: {
        senderName: 'Kejilah',
        senderAddress: 'no-reply@kejilah.co',
    },
    corsOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:3001'],
};
//# sourceMappingURL=branding.config.js.map