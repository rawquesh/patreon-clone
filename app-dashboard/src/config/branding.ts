/**
 * Central branding configuration.
 * A buyer changes values here — everything else auto-updates.
 */

export const branding = {
  appName: 'Patreon Clone',
  tagline: 'Empowering creators and their communities',
  shortName: 'Patreon Clone',
  description: 'Patreon Clone',

  support: {
    email: 'admin@patreon-clone.example.com',
    url: 'https://patreon-clone.example.com/support',
  },

  social: {
    twitter: 'https://twitter.com/patreon-clone',
    instagram: 'https://instagram.com/patreon-clone',
    github: 'https://github.com/patreon-clone',
  },

  /** Lucide icon name used as the app logo mark in the sidebar header */
  logoIcon: 'LayoutTemplate' as const,
} as const;

export type Branding = typeof branding;
