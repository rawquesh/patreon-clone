// Re-export from centralized types (single source of truth)
export { CreatorCategory } from "@/typings/IUser";
export type { CreatorCategory as CreatorCategoryType } from "@/typings/IUser";

// Build the categories list from the enum values
export const HARDCODED_CATEGORIES = [
  { id: "MUSIC_ART", name: "Music & Art" },
  { id: "ENTERTAINMENT_COMEDY", name: "Entertainment & Comedy" },
  { id: "HISTORY_LITERACY", name: "History & Literacy" },
  { id: "GENERAL_EDUCATION", name: "General Education" },
  { id: "FOOD_COOKING", name: "Food & Cooking" },
  { id: "LIFESTYLE_WELLNESS", name: "Lifestyle & Wellness" },
  { id: "TRAVEL_ISRAEL", name: "Travel & Israel" },
  { id: "BUSINESS_FINANCE", name: "Business & Finance" },
  { id: "RELATIONSHIPS_PARENTING", name: "Relationships & Parenting" },
  { id: "TORAH_STUDY", name: "Torah Study" },
  { id: "FITNESS_HEALTH", name: "Fitness & Health" },
];
