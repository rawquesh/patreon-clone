/**
 * Central branding configuration.
 * A buyer changes values here — everything else auto-updates.
 */

export const branding = {
  appName: 'Blue Touch',
  tagline: 'Empowering creators and their communities',
  shortName: 'Blue Touch',
  description: 'Blue Touch',

  support: {
    email: 'info@bluetouch.dev',
    url: 'https://bluetouch.dev/support',
  },

  social: {
    twitter: 'https://twitter.com/bluetouch',
    instagram: 'https://instagram.com/patreon-clone',
    github: 'https://github.com/patreon-clone',
  },

  /** Lucide icon name used as the app logo mark in the sidebar header */
  logoIcon: 'LayoutTemplate' as const,
} as const;

export type Branding = typeof branding;
