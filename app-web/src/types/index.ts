/**
 * Centralized type exports.
 * Use `import { SomeType } from "@/types"` for all new code.
 * Existing imports from `@/typings` continue to work (backward compatible).
 */

// User types
export type {
  User,
  CreatorStatus,
  CreatorCategory,
  ContentVisibility,
  GenderPreference,
} from "@/typings/IUser";

// Chat types
export type {
  IChat,
} from "@/typings/IChat";

// Message types
export type {
  IMessage,
} from "@/typings/IMessage";

// Post types
export type {
  SortOrder,
  SortBy,
  PostType,
  PostFilterParams,
  PostCreator,
  PostItem,
  PaginationInfo,
  PostsResponse,
  PostData,
  IComment,
  CommentsResponse,
  CommentResponse,
  LikeResponse,
} from "@/typings/IPost";

// Subscription & membership types
export type {
  SubscriptionStatus,
  ISubscription,
  Creator as SubscriptionCreator,
  Membership,
  IMembership,
  SubscriptionResponse,
  SubscriptionsResponse,
  ICheckSubscriptionResponse,
  IPromotionValidationResponse,
  IPromotionRedemptionResponse,
  SubscriptionFilterParams,
} from "@/typings/ISubscription";

// Collection types
export type {
  CollectionCreator,
  CollectionDetails,
  CollectionWithPostsResponse,
  Creator as CollectionCreatorInfo,
  Post as CollectionPost,
  Creator2,
} from "@/typings/ICollection";

// Comment types
export type {
  ICommentUser,
  ICommentData,
  ICommentResponse,
  IComment as InternalComment,
} from "@/typings/IComment";

// Discount / promotion types
export {
  DiscountType,
  DiscountStatus,
  DiscountApplicability,
  GiftType,
} from "@/typings/IDiscount";

export type {
  IDiscount,
  IGift,
  CreateDiscountDto,
  UpdateDiscountDto,
  CreateGiftDto,
  UpdateGiftDto,
} from "@/typings/IDiscount";

// Notification types
export {
  NotificationType,
} from "@/typings/INotification";

export type {
  INotification,
  NotificationResponseDto,
  NotificationFilterDto,
  MarkReadDto,
} from "@/typings/INotification";

// Member types
export type {
  Member,
  MemberFilterParams,
  MembersResponse,
} from "@/typings/IMember";

// Tier access types
export type {
  TierAccess,
} from "@/typings/ITierAccess";

// Insights / analytics types
export {
  TimeRange,
  EarningsFilter,
} from "@/typings/insights";

export type {
  TierStats,
  MembershipInsightsResponse,
  TierBreakdown,
  EarningsInsightsResponse,
  PostStats,
  PostsInsightsResponse,
} from "@/typings/insights";

// Local types
export { Gender } from "./auth";
