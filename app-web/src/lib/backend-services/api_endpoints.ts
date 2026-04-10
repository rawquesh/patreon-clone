/**
 * Centralized API Endpoints for easier maintenance.
 *
 * All API endpoints are defined here to avoid hardcoded strings across the codebase.
 * When adding new endpoints, add them to the appropriate section below.
 */
export class ApiEndpoints {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================
  static readonly authLogin = "/auth/login";
  static readonly authRegister = "/auth/register";
  static readonly authUser = "/auth/user";
  static authCheckEmail = (email: string) => `/auth/check-email/${email}`;
  static readonly authGoogle = "/auth/google";
  static readonly authGoogleMobile = "/auth/google/mobile";

  // ==========================================================================
  // USERS
  // ==========================================================================
  static readonly usersProfile = "/users/profile";
  static readonly usersProfilePhoto = "/users/profile/photo";
  static readonly usersPreferences = "/users/preferences";
  static readonly usersOnboardCreator = "/users/onboard-creator";
  static usersCheckUsername = (username: string) =>
    `/users/check-username/${username}`;

  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================
  static readonly notifications = "/notifications";
  static readonly notificationsCount = "/notifications/count";
  static readonly notificationsMarkRead = "/notifications/mark-read";
  static readonly notificationsMarkAllRead = "/notifications/mark-all-read";
  static readonly notificationsSettings = "/notifications/settings";
  static readonly notificationSettingsCreator = "/notifications/settings/creator";
  static notification = (id: string) => `/notifications/${id}`;

  // ==========================================================================
  // POST ACCESS
  // ==========================================================================
  static postCheckAccess = (postId: string) => `/posts/${postId}/check-access`;

  // ==========================================================================
  // MEMBERSHIP FEATURED
  // ==========================================================================
  static membershipFeaturedUpdate = (id: string) => `/memberships/${id}/featured`;

  // ==========================================================================
  // POSTS
  // ==========================================================================
  static readonly postsMyPosts = "/posts/my-posts";
  static readonly postsDrafts = "/posts/drafts";
  static readonly postsText = "/posts/text";
  static readonly postsImage = "/posts/image";
  static readonly postsVideo = "/posts/video";
  static readonly postsAudio = "/posts/audio";
  static readonly postsLink = "/posts/link";

  static post = (id: string) => `/posts/${id}`;
  static postComments = (postId: string) => `/posts/${postId}/comments`;
  static postLikes = (postId: string) => `/posts/${postId}/likes`;
  static postLiked = (postId: string) => `/posts/${postId}/liked`;
  static postLike = (postId: string) => `/posts/${postId}/like`;
  static postPublish = (postId: string) => `/posts/${postId}/publish`;
  static postUnpublish = (postId: string) => `/posts/${postId}/unpublish`;
  static postPermanent = (postId: string) => `/posts/${postId}/permanent`;
  static postsByCreator = (creatorId: string) =>
    `/posts/by-creator/${creatorId}`;

  static postTextUpdate = (id: string) => `/posts/text/${id}`;
  static postImageUpdate = (id: string) => `/posts/image/${id}`;
  static postVideoUpdate = (id: string) => `/posts/video/${id}`;
  static postAudioUpdate = (id: string) => `/posts/audio/${id}`;
  static postLinkUpdate = (id: string) => `/posts/link/${id}`;

  static commentLikes = (postId: string, commentId: string) =>
    `/posts/${postId}/comments/${commentId}/likes`;
  static commentLiked = (postId: string, commentId: string) =>
    `/posts/${postId}/comments/${commentId}/liked`;
  static commentLike = (postId: string, commentId: string) =>
    `/posts/${postId}/comments/${commentId}/like`;
  static commentUpdate = (postId: string, commentId: string) =>
    `/posts/${postId}/comments/${commentId}`;

  // ==========================================================================
  // CREATORS
  // ==========================================================================
  static creator = (username: string) => `/creator/${username}`;
  static creatorStats = (creatorId: string) =>
    `/creator/${creatorId}/stats`;

  static readonly creatorsRecentlyVisited = "/creators/recently-visited";
  static readonly creatorsTop = "/creators/top";
  static readonly creatorsPopularThisWeek = "/creators/popular-this-week";
  static creatorsTopByCategory = (category: string) =>
    `/creators/top-by-category/${category}`;

  // ==========================================================================
  // MEMBERSHIPS
  // ==========================================================================
  static readonly memberships = "/memberships";
  static readonly membershipsCreator = "/memberships/creator";
  static readonly membershipsSubscriber = "/memberships/subscriber";

  static membershipById = (id: string) => `/memberships/${id}`;
  static membershipCheckout = (id: string) => `/memberships/checkout/${id}`;
  static membershipCheck = (creatorId: string) =>
    `/memberships/check/${creatorId}`;
  static membershipFeatured = (id: string) => `/memberships/${id}/featured`;
  static membershipSubscribe = (subscriptionId: string) =>
    `/memberships/subscribe/${subscriptionId}`;
  static membershipSubscribeFree = (creatorId: string) =>
    `/memberships/subscribe/free/${creatorId}`;
  static membershipsByCreator = (creatorId: string) =>
    `/memberships/creator/${creatorId}`;

  // ==========================================================================
  // COLLECTIONS
  // ==========================================================================
  static readonly collections = "/collections";
  static readonly collectionsMy = "/collections/my-collections";
  static collectionById = (id: string) => `/collections/${id}`;
  static collectionPosts = (id: string) => `/collections/${id}/posts`;

  // ==========================================================================
  // CHAT
  // ==========================================================================
  static readonly chat = "/chat";
  static readonly chatGroup = "/chat/group";
  static readonly chatDirect = "/chat/direct";
  static readonly chatUnreadCount = "/chat/unread/count";
  static chatMessages = (chatId: string) => `/chat/${chatId}/messages`;
  static chatMessageDates = (chatId: string) => `/chat/${chatId}/message-dates`;
  static chatRead = (chatId: string) => `/chat/${chatId}/read`;
  static chatById = (chatId: string) => `/chat/${chatId}`;

  // ==========================================================================
  // MEMBERS/AUDIENCE
  // ==========================================================================
  static readonly members = "/members";
  static readonly membersExport = "/members/export";

  // ==========================================================================
  // SEARCH
  // ==========================================================================
  static readonly search = "/search";
  static readonly searchCreator = "/search/creator";

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================
  static readonly analyticsEarnings = "/analytics/earnings";
  static readonly analyticsMemberships = "/analytics/memberships";
  static readonly analyticsPosts = "/analytics/posts";

  // ==========================================================================
  // HOME / FEED
  // ==========================================================================
  static readonly homeRecentlyVisited = "/home/recently-visited";
  static readonly homeRecentlyVisitedPublic = "/home/recently-visited-public";
  static readonly homeTopCreators = "/home/top-creators";
  static readonly homePopularThisWeek = "/home/popular-this-week";
  static readonly homeTopByCategory = "/home/top-by-category";
  static readonly homeSubscribedFeed = "/home/subscribed-feed";

  // ==========================================================================
  // PROMOTIONS
  // ==========================================================================
  static readonly promotionsDiscounts = "/promotions/discounts";
  static readonly promotionsGifts = "/promotions/gifts";
  static discountById = (id: string) => `/promotions/discounts/${id}`;
  static giftById = (id: string) => `/promotions/gifts/${id}`;
  static readonly promotionsDiscountsGenerateCode =
    "/promotions/discounts/generate-code";
  static readonly promotionsGiftsGenerateCode = "/promotions/gifts/generate-code";
  static readonly promotionsDiscountsValidate = "/promotions/discounts/validate";
  static readonly promotionsDiscountsRedeem = "/promotions/discounts/redeem";
  static readonly promotionsValidate = "/promotions/validate";
  static readonly promotionsRedeem = "/promotions/redeem";
}
