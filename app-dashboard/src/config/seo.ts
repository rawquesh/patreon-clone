import { branding } from './branding';

export const seo = {
  titleTemplate: `%s | ${branding.appName}`,
  defaultTitle: branding.appName,
  defaultDescription: branding.description,
  openGraph: {
    siteName: branding.appName,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    site: branding.social.twitter,
  },
} as const;
