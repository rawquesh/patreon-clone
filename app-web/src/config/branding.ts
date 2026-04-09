/**
 * Centralized branding configuration.
 * A buyer only needs to change values here to rebrand the entire application.
 *
 * @example
 * // Change product name:
 * name: "My Platform",
 *
 * // Change API server:
 * api: { serverUrl: "https://my-api-server.com" },
 *
 * // Change colors:
 * colors: {
 *   primary: "#3B82F6",
 *   primaryHover: "#2563EB",
 * },
 */

export const branding = {
  // Product / company name
  name: "Patreon Clone",

  // Tagline shown in marketing hero sections
  tagline: "Build a thriving Jewish Community online",

  // Default SEO description (used in metadata)
  description: "Build a thriving Jewish Community online",

  // Domain URLs
  urls: {
    /** Primary frontend domain */
    frontend: "patreon-clone.example.com",
    /** Backend API server */
    apiServer: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    /** Meeting/scheduling URL used in marketing CTAs */
    meeting: "app.simplymeet.me/patreon-clone/patreon-clone-intro",
  },

  // Contact information
  contact: {
    supportEmail: "support@patreon-clone.example.com",
    privacyEmail: "privacy@patreon-clone.example.com",
    companyName: "Patreon Clone",
  },

  // Asset paths (relative to /public)
  assets: {
    logo: "/icons/logo.svg",
    logoPng: "/icons/logo.png",
    heroImage: "/hero.png",
    favicon: "/icons/logo.svg",
    avatarPlaceholder: "/podcast.jpg",
    /** Base URL for S3 asset buckets (used for user-uploaded content) */
    assetBucketBase: `${process.env.NEXT_PUBLIC_API_IMAGE_BUCKET || "patreon-clone-test-dps"}.s3.eu-north-1.amazonaws.com`,
  },

  // Brand color palette (hex values)
  // Note: These are also defined as Chakra theme tokens in lib/theme.ts.
  // This config provides a single source of truth for hardcoded inline color values.
  colors: {
    primary: "#1D70BF",
    primaryHover: "#3283d1",
    primaryDark: "#1962A5",
    accent: "#CB785C",
    accentDark: "#AB5437",
    desert: "#BF9373",
    desertDark: "#AD805F",
    dune: "#BFAF8F",
    duneLight: "#F1E6D0",
    green: "#86BF8E",
    greenDark: "#618967",
    star: "#5A5954",
    textHeader: "#141413",
    textDark: "#201F18",
    border: "#E6E5DD",
    bgLight: "#EBEAE4",
    bgWarm: "#F7F5ED",
    white: "#FFFFFF",
    /** Used for join/subscribe/success action buttons */
    success: "#38A169",
    /** Used for like/heart interaction feedback */
    like: "#e92145",
    /** Used for default link color in some pages */
    linkBlue: "#3182ce",
    /** Light blue variant used in about page */
    lightBlue: "#73BAFF",
    /** Desert light variant used in about page */
    desertLight: "#EBDBBC",
    /** Green light variant used in about page */
    greenLight: "#B8E5BE",
    /** Gray-tan variant used in about page */
    grayTan: "#C4C3BB",
  },

  // Copyright text (year is automatically updated via a getter)
  get copyright() { return `© ${new Date().getFullYear()} ${this.name}. All rights reserved.`; },

  // Platform settings
  platform: {
    /** Platform fee percentage taken from creators */
    feePercentage: 10,
  },

  // Social media handles
  social: {
    twitter: "@patreon-clone",
  },

  // Third-party service keys (these should be overridden via environment variables)
  services: {
    web3FormsAccessKey:
      process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "",
  },
} as const;

export type Branding = typeof branding;
