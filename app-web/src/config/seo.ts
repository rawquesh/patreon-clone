import type { Metadata } from "next";
import { branding } from "./branding";

/**
 * SEO / metadata defaults for the root layout.
 * All pages should extend these defaults.
 */
export const seoDefaults = (baseUrl: string): Metadata => ({
  metadataBase: new URL(baseUrl),
  title: {
    default: branding.name,
    template: `%s | ${branding.name}`,
  },
  description: branding.description,
  icons: {
    icon: branding.assets.favicon,
    apple: branding.assets.favicon,
    shortcut: branding.assets.favicon,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  openGraph: {
    title: branding.name,
    description: branding.description,
    url: baseUrl,
    siteName: branding.name,
    images: [
      {
        url: branding.assets.heroImage,
        width: 1200,
        height: 630,
        alt: `${branding.name} - ${branding.tagline}`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: branding.name,
    description: branding.description,
    images: [branding.assets.heroImage],
  },
});

/**
 * Build the site base URL from environment variables.
 * Falls back to the configured brand domain.
 */
export const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `https://${branding.urls.frontend}`;
};
