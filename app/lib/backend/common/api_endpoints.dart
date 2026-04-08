/// Centralized API Endpoints for easier maintenance.
///
/// All API endpoints are defined here to avoid hardcoded strings across the codebase.
/// When adding new endpoints, add them to the appropriate section below.
class ApiEndpoints {
  ApiEndpoints._();

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================
  static const String authGoogleMobile = '/auth/google/mobile';
  static const String authLogin = '/auth/login';
  static const String authRegister = '/auth/register';
  static const String authUser = '/auth/user';
  static String authCheckEmail(String email) => '/auth/check-email/$email';

  // ==========================================================================
  // USERS
  // ==========================================================================
  static const String usersProfile = '/users/profile';
  static const String usersProfilePhoto = '/users/profile/photo';
  static const String usersProfileCover = '/users/profile/cover';
  static const String usersCreatorHeadline = '/users/creator/headline';
  static const String usersOnboardCreator = '/users/onboard-creator';
  static const String usersResetPassword = '/users/reset-password';
  static const String usersContentVisibility = '/users/creator/content-visibility';
  static const String usersCreatorCategory = '/users/creator/category';
  static const String usersPublishCreator = '/users/publish-creator';
  static const String usersStripeOnboardingComplete = '/users/stripe-onboarding/complete';
  static const String usersSocialLinks = '/users/social-links';
  static const String usersAbout = '/users/about';
  static const String usersAccount = '/users/account';
  static const String usersSubscriptions = '/users/subscriptions';
  static const String usersCreatorSubscribersSearch = '/users/creator/subscribers/search';
  static String usersCreatorAbout(String username) => '/users/creator/$username/about';

  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================
  static const String notifications = '/notifications';
  static const String notificationSettingsMember = '/notifications/settings/member';
  static const String notificationSettingsCreator = '/notifications/settings/creator';

  // ==========================================================================
  // POSTS
  // ==========================================================================
  static const String postsText = '/posts/text';
  static const String postsVideo = '/posts/video';
  static const String postsAudio = '/posts/audio';
  static const String postsImage = '/posts/image';
  static const String postsLink = '/posts/link';
  static String post(String id) => '/posts/$id';
  static String postComments(String postId) => '/posts/$postId/comments';
  static String postsByCreator(String creatorId) => '/posts/by-creator/$creatorId';
  static String postByTypeAndId(String type, String id) => '/posts/$type/$id';
  static String imagePostUpdate(String id) => '/posts/image/$id';
  static String postLiked(String postId) => '/posts/$postId/liked';
  static String postLike(String postId) => '/posts/$postId/like';
  static String postPublish(String postId) => '/posts/$postId/publish';
  static String postUnpublish(String postId) => '/posts/$postId/unpublish';
  static String postPermanent(String postId) => '/posts/permanent/$postId';
  static String commentLikes(String postId, String commentId) => '/posts/$postId/comments/$commentId/likes';
  static String commentLiked(String postId, String commentId) => '/posts/$postId/comments/$commentId/liked';
  static String commentLike(String postId, String commentId) => '/posts/$postId/comments/$commentId/like';

  // ==========================================================================
  // CREATORS
  // ==========================================================================
  static const String homeTopCreators = '/home/top-creators';
  static const String homeTopByCategory = '/home/top-by-category';
  static String creator(String username) => '/creator/$username';
  static String creatorStats(String creatorId) => '/creator/$creatorId/stats';
  static String searchCreator = '/search/creator';

  // ==========================================================================
  // MEMBERSHIPS
  // ==========================================================================
  static const String membershipsCreator = '/memberships/creator';
  static const String memberships = '/memberships';
  static String membershipById(String id) => '/memberships/$id';
  static String membershipCheckout(String id) => '/memberships/checkout/$id';
  static String membershipCheck(String creatorId) => '/memberships/check/$creatorId';
  static String membershipFeatured(String id) => '/memberships/$id/featured';
  static String membershipUnsubscribe(String creatorId) => '/memberships/unsubscribe/$creatorId';
  static String membershipsByCreator(String creatorId) => '/memberships/creator/$creatorId';
  static String membershipSubscribeFree(String creatorId) => '/memberships/subscribe/free/$creatorId';

  // ==========================================================================
  // COLLECTIONS
  // ==========================================================================
  static const String collections = '/collections';
  static String collectionById(String id) => '/collections/$id';
  static String collectionsByCreator(String creatorId) => '/collections/creator/$creatorId';
  static String collectionPosts(String collectionId) => '/collections/$collectionId/posts';

  // ==========================================================================
  // CHAT
  // ==========================================================================
  static const String chat = '/chat';
  static const String chatGroup = '/chat/group';
  static const String chatDirect = '/chat/direct';
  static String chatMessages(String chatId) => '/chat/$chatId/messages';

  // ==========================================================================
  // PAYMENTS
  // ==========================================================================
  static const String paymentsAvailable = '/payments/available';
  static const String paymentsTransfer = '/payments/transfer';
  static const String paymentsHistory = '/payments/history';

  // ==========================================================================
  // LIBRARY (User's own posts)
  // ==========================================================================
  static const String postsMyPosts = '/posts/my-posts';
  static const String postsDrafts = '/posts/drafts';

  // ==========================================================================
  // MEMBERS/AUDIENCE
  // ==========================================================================
  static const String members = '/members';

  // ==========================================================================
  // REPORTS
  // ==========================================================================
  static const String reportsPosts = '/reports/posts';
  static const String reportsUsers = '/reports/users';

  // ==========================================================================
  // PROMOTIONS
  // ==========================================================================
  static const String promotionsDiscounts = '/promotions/discounts';
  static const String promotionsGifts = '/promotions/gifts';
  static String discountById(String id) => '/promotions/discounts/$id';
  static String giftById(String id) => '/promotions/gifts/$id';

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================
  static const String analyticsEarnings = '/analytics/earnings';
  static const String analyticsMemberships = '/analytics/memberships';
  static const String analyticsPosts = '/analytics/posts';

  // ==========================================================================
  // S3 UPLOADS
  // ==========================================================================
  static const String s3VideosUploadSession = '/s3/videos/upload-session';
  static const String s3VideosCompleteUpload = '/s3/videos/complete-upload';

  // ==========================================================================
  // HOME/FEED
  // ==========================================================================
  static const String homeSubscribedFeed = '/home/subscribed-feed';

  // ==========================================================================
  // PUSH NOTIFICATIONS
  // ==========================================================================
  static const String pushNotificationsStoreToken = '/push-notifications/store-token';
}
