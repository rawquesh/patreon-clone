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
      tag: "Torah Learning",
      title: "Daily Daf Insights",
      description:
        "A community dedicated to daily Talmud study with insightful commentary and discussion.",
      stat1: "5.2K Members",
      stat2: "Daily",
      author: {
        name: "Rabbi David Katz",
        title: "Torah Educator",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
    },
    {
      imageSrc:
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400",
      tag: "Jewish Art",
      title: "Modern Judaica",
      description:
        "Contemporary Jewish artists exploring traditional themes through modern artistic expressions.",
      stat1: "3.8K Members",
      stat2: "Weekly",
      author: {
        name: "Sarah Goldstein",
        title: "Jewish Visual Artist",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
    },
    {
      imageSrc:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400",
      tag: "Podcast",
      title: "Jewish History Unveiled",
      description:
        "Exploring the rich tapestry of Jewish history through engaging storytelling and scholarly research.",
      stat1: "7.4K Listeners",
      stat2: "Bi-weekly",
      author: {
        name: "Josh Levine",
        title: "Jewish History Podcaster",
        avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      },
    },
  ],

  /** Feature section tabs shown on the homepage */
  featureSection: {
    pillLabel: "Why Creators Choose Patreon Clone",
    heading: "A space built for Jewish voices to thrive",
    description:
      "In a digital landscape that wasn't designed with us in mind, Patreon Clone offers Jewish creators and their communities a dedicated platform to connect, create, and grow together.",
  },

  /** Testimonials section heading */
  testimonialsSection: {
    pillLabel: "Success Stories",
    heading: "Voices from Our Patreon Clone",
    subheading: "Hear from creators who've found their home with us",
  },

  /** Testimonials shown in the slider on the homepage.
   *  Use the placeholder "{name}" in quote text — it will be replaced with branding.name at runtime. */
  testimonials: [
    {
      id: 1,
      quote:
        "{name} has transformed how I share my Torah insights. I've built a supportive community that values depth and authenticity, away from the noise of mainstream platforms. The sustainable income has allowed me to dedicate more time to learning and teaching without constantly chasing algorithms or trends.",
      author: "Rabbi David Katz",
      title: "Torah Educator",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      quote:
        "After years of fighting Instagram's algorithm, {name} feels like coming home. I create Jewish art that doesn't always fit the 'trending' mold, and here I can share my work with people who truly appreciate it. My subscription community is smaller than my social following, but it generates 5x more income and feels infinitely more meaningful. The best part? Direct connection with my community without algorithm interference.",
      author: "Sarah Goldstein",
      title: "Jewish Visual Artist",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      quote:
        "My Jewish history podcast was growing steadily, but monetization was a constant struggle. On {name}, I've built a thriving community that supports my work directly. The platform makes it easy to share exclusive episodes, host live discussions, and connect with listeners who care deeply about our shared heritage. I've finally found the perfect balance between creative freedom and sustainable income — all in a space that respects and celebrates Jewish voices.",
      author: "Josh Levine",
      title: "Jewish History Podcaster",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
  ],
} as const;

export type Marketing = typeof marketing;
