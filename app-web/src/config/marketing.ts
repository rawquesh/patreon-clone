/**
 * Centralized marketing page configuration.
 * A buyer only needs to change values here to customize the marketing experience.
 */

export const marketing = {
  /** Section heading pill on the community cards section of the homepage */
  communitySection: {
    pillLabel: "Find Your Community",
  },

  /** Hero section statistics shown on the homepage */
  heroStats: {
    activeCommunities: "50+",
    communityMembers: "100k+",
    generatedRevenue: "$1M+",
  },

  /** Community cards shown on the homepage "Find Your Community" section */
  communityCards: [
    {
      imageSrc:
        "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=400",
      tag: "Education",
      title: "Daily Learning Insights",
      description:
        "A community dedicated to daily learning with insightful commentary and discussion.",
      stat1: "5.2K Members",
      stat2: "Daily",
      author: {
        name: "David Smith",
        title: "Content Educator",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
    },
    {
      imageSrc:
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400",
      tag: "Digital Art",
      title: "Modern Digital Art",
      description:
        "Contemporary digital artists exploring creative themes through modern artistic expressions.",
      stat1: "3.8K Members",
      stat2: "Weekly",
      author: {
        name: "Sarah Goldstein",
        title: "Digital Artist",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
    },
    {
      imageSrc:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400",
      tag: "Podcast",
      title: "History Unveiled",
      description:
        "Exploring rich topics through engaging storytelling and in-depth research.",
      stat1: "7.4K Listeners",
      stat2: "Bi-weekly",
      author: {
        name: "Josh Miller",
        title: "Podcast Host",
        avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      },
    },
  ],

  /** Feature section tabs shown on the homepage */
  featureSection: {
    pillLabel: "Why Creators Choose Us",
    heading: "A space built for creators to thrive",
    description:
      "In a digital landscape that wasn't designed with creators in mind, we offer creators a dedicated platform to connect, create, and grow together.",
  },

  /** Testimonials section heading */
  testimonialsSection: {
    pillLabel: "Success Stories",
    heading: "Voices from Our Community",
    subheading: "Hear from creators who've found their home with us",
  },

  /** Testimonials shown in the slider on the homepage.
   *  Use the placeholder "{name}" in quote text — it will be replaced with branding.name at runtime. */
  testimonials: [
    {
      id: 1,
      quote:
        "{name} has transformed how I share my content. I've built a supportive community that values depth and authenticity, away from the noise of mainstream platforms. The sustainable income has allowed me to dedicate more time to creating without constantly chasing algorithms or trends.",
      author: "David Smith",
      title: "Content Educator",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      quote:
        "After years of fighting Instagram's algorithm, {name} feels like coming home. I create digital content that doesn't always fit the 'trending' mold, and here I can share my work with people who truly appreciate it. My subscription community is smaller than my social following, but it generates 5x more income and feels infinitely more meaningful. The best part? Direct connection with my community without algorithm interference.",
      author: "Sarah Goldstein",
      title: "Digital Artist",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      quote:
        "My podcast was growing steadily, but monetization was a constant struggle. On {name}, I've built a thriving community that supports my work directly. The platform makes it easy to share exclusive episodes, host live discussions, and connect with listeners who care deeply about our shared interests. I've finally found the perfect balance between creative freedom and sustainable income — all in a space that respects and celebrates creators.",
      author: "Josh Miller",
      title: "Podcast Host",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
  ],

  // -----------------------------------------------------------------------
  // New sections for strings hardcoded in source files
  // -----------------------------------------------------------------------

  /** Hero / homepage sections */
  heroSection: {
    welcomeMessage: "Welcome to Patreon Clone",
    joinMessage: "Join Thriving Creator Communities",
    discoverMessage: "Discover spaces where voices are celebrated, shared, and supported.",
    fromText: "From teachers to artists, find your community.",
    joinCreators: "Join hundreds of creators building meaningful connections",
    directAccess: "Direct access to the voices you love",
  },

  /** Community page */
  communityPage: {
    title: "Creator Communities",
    subtitle: "Connect with passionate creators across a variety of topics",
  },

  /** Marketing header app name display */
  appName: "Creator Hub",

  /** Interactive hero component */
  interactiveHero: {
    subtitle: "A space built for creators and their communities",
  },

  /** About page */
  aboutPage: {
    missionHeading: "Our Mission",
    ourStoryHeading: "Our Story",
    ourValuesHeading: "Our Values",
    joinHeading: "Join Our Growing Community",
    getStartedCta: "Get Started Today",
    // Page body text
    introText: "We believe in the power of community to nurture, support, and inspire. Our platform is designed to strengthen these bonds.",
    values: [
      {
        title: "Community First",
        description: "Our platform is built with an understanding of diverse creator needs, cultural nuances, and community building at its core.",
      },
      {
        title: "Fair Compensation",
        description: "We honor creators by providing fair compensation and a platform that respects their work, voice, and contribution to culture.",
      },
      {
        title: "Long-Term Growth",
        description: "We're building for the long term, creating sustainable infrastructure for creators to thrive for generations to come.",
      },
      {
        title: "Transparency",
        description: "Clear pricing, straightforward terms, and open communication — so creators always know where they stand.",
      },
    ],
    missionText: "empowers creators to share their voices, build",
    missionTextFull: "empowers creators to share their voices, build their communities, and earn sustainable income from their work.",
    storyIntro: "was founded with a clear vision: to create a",
    storyMid: "platform that addresses the needs of creators",
    storyBottom: "and community builders.",
    storyTeam: "Our team of creators, technologists, and community",
    altText: "creator community gathering",
    valuesIntro: "At our company, our work is guided by a set of core principles that",
    valuesFull: "shape every decision we make. These principles ensure we stay true to our mission of empowering creators.",
    teamText: "is built by a diverse team of creators,",
    teamFull: "technologists, and community builders who are passionate about the creator economy.",
    ctaText: "Become part of our community and help us build the future of",
    ctaFull: "creator communities",
  },

  /** Legal pages — titles */
  legal: {
    termsTitle: "Terms of Service",
    privacyTitle: "Privacy Policy",
    guidelinesTitle: "Community Guidelines",
    termsIntro: "Welcome to Patreon Clone! We are a platform that empowers content creators to build, engage, and monetize their communities. By using our platform, you agree to these Terms of Service (\"Terms\"), which govern your access to and use of our platform, website, and related services (\"Services\").",
    privacyIntro: "Patreon Clone (\"we,\" \"us,\" or \"our\") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use our website, applications, and services (collectively, the \"Services\"). By using our platform, you agree to the terms of this Privacy Policy. If you do not agree with this policy, please discontinue use of our Services.",
    guidelinesIntro: "is dedicated to fostering a positive, respectful, and meaningful space for creators and their communities. These guidelines are designed to maintain a healthy environment on our platform, ensuring a safe and engaging experience for everyone.",
    guidelinesIntro2: "By using our platform, you agree to abide by these guidelines in addition to our Terms of Service.",
  },

  /** Marketing footer */
  footer: {
    tagline: "Empowering creators to share their voices and build thriving communities",
  },

  /** Home layout footer */
  homeFooter: {
    tagline: "Empowering creators to share their voices and build thriving communities",
  },

  /** Marketing page components */
  marketingFeatures: {
    creatorToolsHeading: "Built for Creators",
    creatorToolsText: "Everything is designed with creators in mind. From intuitive posting tools to advanced analytics, we provide everything you need to grow your audience and income.",
    creatorToolsContent: "We offer powerful tools for creators. Everything reflects the needs of a modern creator, from scheduling to content management.",
    peacefulHeading: "A Peaceful, Creator-Centered Environment",
    peacefulText: "A safe, welcoming environment where creators can share their work authentically, connect with their audience, and build sustainable careers.",
    peacefulContent: "A welcoming environment where creators can share their work authentically and connect with their audience without the noise of mainstream platforms.",
  },

  /** Community card subtitle */
  communityCard: {
    fromText: "From teachers to artists, find your community.",
  },

  /** Pricing page specific */
  pricing: {
    joinCreators: "Join hundreds of creators building meaningful connections",
    whyBuiltForCreators: "is specifically built for creators. Our platform is designed with community values at its core, offering features tailored to creator community needs.",
  },
} as const;

export type Marketing = typeof marketing;
