import 'package:patreon_clone/backend/audience/audience_provider.dart';
import 'package:patreon_clone/backend/collections/collection_provider.dart';
import 'package:patreon_clone/backend/creator/my_creator_provider.dart';
import 'package:patreon_clone/backend/insights_earnings_analytics/earnings_analytics_provider.dart';
import 'package:patreon_clone/backend/insights_memberships_analytics/membership_analytics_provider.dart';
import 'package:patreon_clone/backend/insights_posts_analytics/posts_analytics_provider.dart';
import 'package:patreon_clone/backend/memberships/membership_provider.dart';
import 'package:patreon_clone/backend/notification/notification_provider.dart';
import 'package:patreon_clone/backend/payout/payout_provider.dart';
import 'package:patreon_clone/backend/promotions/gifts/gifts_provider.dart';
import 'package:patreon_clone/styles/theme_provider.dart';

import 'package:patreon_clone/pages/tab_state.dart';
import 'package:patreon_clone/backend/authentication/authentication_provider.dart';
import 'package:patreon_clone/backend/authentication/authentication_controller.dart';
import 'package:patreon_clone/backend/messaging/chat_socket_service.dart';
import 'package:patreon_clone/backend/messaging/direct_message_provider.dart';
import 'package:patreon_clone/backend/post/liked_posts_provider.dart';
import 'package:patreon_clone/backend/post/post_provider.dart';
import 'package:patreon_clone/backend/post_creation/post_creation_provider.dart';
import 'package:patreon_clone/backend/promotions/discount_provider.dart';

class DependencyInjection {
  static final AuthenticationProvider authenticationProvider = AuthenticationProvider();
  static final AuthenticationController authenticationController =
      AuthenticationController(authenticationProvider: authenticationProvider);
  static final AppThemeProvider appThemeProvider = AppThemeProvider();
  static final PostProvider postProvider = PostProvider();
  static final MyCreatorProvider myCreatorProvider = MyCreatorProvider();
  static final DirectMessageProvider directMessageProvider = DirectMessageProvider();
  static final ChatSocketService chatSocketService = ChatSocketService();
  static final LikedPostsProvider likedPostsProvider = LikedPostsProvider();
  static final MyNotificationProvider myNotificationProvider = MyNotificationProvider();
  static final PostCreationProvider postCreationProvider = PostCreationProvider();
  static final CollectionProvider collectionProvider = CollectionProvider();
  static final MembershipProvider membershipProvider = MembershipProvider();
  static final DiscountProvider discountProvider = DiscountProvider();
  static final GiftProvider giftProvider = GiftProvider();
  static final MembershipAnalyticsProvider membershipAnalyticsProvider = MembershipAnalyticsProvider();
  static final EarningsAnalyticsProvider earningsAnalyticsProvider = EarningsAnalyticsProvider();
  static final PostsAnalyticsProvider postsAnalyticsProvider = PostsAnalyticsProvider();
  static final PayoutProvider payoutProvider = PayoutProvider();
  static final AudienceProvider audienceProvider = AudienceProvider();
  static final TabState tabState = TabState();
}
