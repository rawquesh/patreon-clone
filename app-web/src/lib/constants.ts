export enum CreatorCategory {
  MUSIC_ART = "Music & Art",
  ENTERTAINMENT_COMEDY = "Entertainment & Comedy",
  HISTORY_LITERACY = "History & Literacy",
  GENERAL_EDUCATION = "General Education",
  FOOD_COOKING = "Food & Cooking",
  LIFESTYLE_WELLNESS = "Lifestyle & Wellness",
  TRAVEL_ISRAEL = "Travel & Israel",
  BUSINESS_FINANCE = "Business & Finance",
  RELATIONSHIPS_PARENTING = "Relationships & Parenting",
  TORAH_STUDY = "Torah Study",
  FITNESS_HEALTH = "Fitness & Health",
}

export const HARDCODED_CATEGORIES = Object.entries(CreatorCategory).map(
  ([key, value]) => ({
    id: key, // Or potentially generate a unique ID if needed elsewhere
    name: value,
  })
);
