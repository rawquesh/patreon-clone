import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/pages/user/creator/creator_profile_screen.dart';
import 'package:patreon-clone/pages/user/home/splashscreen.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/models/creator/creator_model.dart';
import 'package:patreon-clone/models/collection/collection_data_model.dart';

import 'package:patreon-clone/pages/user/authentication/login_screen.dart';
import 'package:patreon-clone/pages/user/authentication/sign_up_screen.dart';
import 'package:patreon-clone/pages/creator/onboarding/become_creator_onboarding.dart';
import 'package:patreon-clone/pages/user/creator/collections_post_screen.dart';
import 'package:patreon-clone/pages/creator/main/creator_main_screen.dart';
// import '../views/common/screens/splashscreen.dart';
import 'package:patreon-clone/pages/creator/audience/audience_page.dart';
import 'package:patreon-clone/pages/creator/main/my_creator_page.dart';
import 'package:patreon-clone/pages/user/explore/creator_listing_screen.dart';
import 'package:patreon-clone/pages/user/explore/explore_screen.dart';
import 'package:patreon-clone/pages/user/home/main_screen.dart';
import 'package:patreon-clone/pages/user/messaging/chat_screen.dart';
import 'package:patreon-clone/pages/user/post/post_details_screen.dart';
import 'package:patreon-clone/pages/creator/settings/member_settings_screen.dart';
import 'package:patreon-clone/pages/user/memberships/creator_listing_screen.dart';
import 'package:patreon-clone/pages/creator/main/create_post/create_audio_post_screen.dart';
import 'package:patreon-clone/pages/creator/main/create_post/create_post_main_screen.dart';
import 'package:patreon-clone/pages/user/profile/edit_profile_screen.dart';

import 'package:patreon-clone/backend/messaging/direct_message_provider.dart';

import 'package:patreon-clone/pages/user/messaging/group_chat_detail_screen.dart';
import 'package:patreon-clone/pages/user/static/tos.dart';
import 'package:patreon-clone/pages/user/static/privacy_policy.dart';
import 'package:patreon-clone/pages/user/messaging/message_screen.dart';
import 'package:patreon-clone/pages/user/creator/join_membership_screen.dart';
import 'package:patreon-clone/pages/user/authentication/legal_webview_screen.dart';
import 'package:patreon-clone/pages/creator/main/create_post/create_text_post_screen.dart';
import 'package:patreon-clone/pages/creator/main/create_post/create_video_post_screen.dart';
import 'package:patreon-clone/pages/creator/main/create_post/create_image_post_screen.dart';
import 'package:patreon-clone/pages/creator/main/create_post/create_link_post_screen.dart';
import 'package:patreon-clone/pages/creator/promotions/add_edit_discount_screen.dart';
import 'package:patreon-clone/pages/creator/promotions/add_edit_gift_screen.dart';
import 'package:patreon-clone/pages/creator/onboarding/publish_creator_screen.dart';
import 'package:patreon-clone/models/promotions/discount/discount_model.dart';
import 'package:patreon-clone/models/promotions/gift/gift_model.dart';
import 'package:patreon-clone/pages/creator/main/components/add_edit_about_screen.dart';
import 'package:patreon-clone/models/social_link/social_links.dart';
import 'package:patreon-clone/pages/creator/main/create_post/video_trimmer_screen.dart';
import 'dart:io';

class Routes {
  static const String splash = "splash";
  static const String login = "login";
  static const String signUp = "signUp";
  static const String main = "main";
  static const String editProfile = "editProfile";
  static const String postDetails = "postDetails";
  static const String creatorListing = "creatorListing";
  static const String membershipListing = "membershipListing";
  static const String becomeCreatorOnboarding = "becomeCreatorOnboarding";
  static const String myCreatorPage = "myCreatorPage";
  static const String creatorMain = "creatorMain";
  // static const String createAudioPost = "createAudioPost"; // Removed duplicate
  static const String createPostMain = "createPostMain";
  static const String explore = "explore";
  static const String memberSettings = "memberSettings";
  static const String collectionPosts = "collectionPosts";
  static const String audience = "audience";
  static const String creatorProfile = "creatorProfile";
  static const String chat = "chat";
  static const String groupChatDetails = "groupChatDetails";
  static const String tos = "tos";
  static const String privacyPolicy = "privacyPolicy";
  static const String messaging = "messaging";
  static const String joinMembership = "joinMembership";
  static const String legal = "legal";
  static const String createTextPost = "createTextPost";
  static const String createVideoPost = "createVideoPost";
  static const String createAudioPost = "createAudioPost";
  static const String createImagePost = "createImagePost";
  static const String createLinkPost = "createLinkPost";
  // static const String audience = "audience"; // Removed duplicate
  static const String addEditDiscount = "addEditDiscount";
  static const String addEditGift = "addEditGift";
  static const String publishCreator = "publishCreator";
  static const String addEditAbout = "addEditAbout";
  static const String videoTrimmer = "videoTrimmer";
}

class AppRouter {
  static final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

  static final GoRouter router = GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/',
    debugLogDiagnostics: true,
    routes: <RouteBase>[
      GoRoute(
        path: '/',
        name: Routes.splash,
        builder: (BuildContext context, GoRouterState state) {
          return const SplashScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.login}',
        name: Routes.login,
        builder: (BuildContext context, GoRouterState state) {
          return const LoginScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.signUp}',
        name: Routes.signUp,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return SignUpScreen(
            userModel: args['userModel'] as UserModel?,
            isGoogleSignIn: args['isGoogleSignIn'] as bool? ?? false,
          );
        },
      ),
      GoRoute(
        path: '/${Routes.main}',
        name: Routes.main,
        builder: (BuildContext context, GoRouterState state) {
          bool forceRefresh = false;
          if (state.extra is Map<String, dynamic>) {
            forceRefresh = (state.extra as Map<String, dynamic>)['forceRefresh'] as bool? ?? false;
          } else if (state.extra is bool) {
            forceRefresh = state.extra as bool;
          }
          return MainScreen(forceRefresh: forceRefresh);
        },
      ),
      GoRoute(
        path: '/${Routes.editProfile}',
        name: Routes.editProfile,
        builder: (BuildContext context, GoRouterState state) {
          return const EditProfileScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.postDetails}',
        name: Routes.postDetails,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return PostDetailsScreen(
            postId: args['postId'] as String?,
            postModel: args['postModel'] as PostModel?,
          );
        },
      ),
      GoRoute(
        path: '/${Routes.creatorListing}',
        name: Routes.creatorListing,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return CreatorListingScreen(
            category: args['category'] as String?,
            creators: args['creators'] as List<CreatorModel>?,
          );
        },
      ),
      GoRoute(
        path: '/${Routes.membershipListing}',
        name: Routes.membershipListing,
        builder: (BuildContext context, GoRouterState state) {
          return const MembershipListingScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.becomeCreatorOnboarding}',
        name: Routes.becomeCreatorOnboarding,
        builder: (BuildContext context, GoRouterState state) {
          return const BecomeCreatorOnboarding();
        },
      ),
      GoRoute(
        path: '/${Routes.myCreatorPage}',
        name: Routes.myCreatorPage,
        builder: (BuildContext context, GoRouterState state) {
          return const MyCreatorPage();
        },
      ),
      GoRoute(
        path: '/${Routes.creatorMain}',
        name: Routes.creatorMain,
        builder: (BuildContext context, GoRouterState state) {
          return const CreatorMainScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.createAudioPost}',
        name: Routes.createAudioPost,
        builder: (BuildContext context, GoRouterState state) {
          return const CreateAudioPostScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.createPostMain}',
        name: Routes.createPostMain,
        builder: (BuildContext context, GoRouterState state) {
          return const CreatePostMainScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.explore}',
        name: Routes.explore,
        builder: (BuildContext context, GoRouterState state) {
          return const ExploreScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.memberSettings}',
        name: Routes.memberSettings,
        builder: (BuildContext context, GoRouterState state) {
          return const MemberSettingsScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.collectionPosts}',
        name: Routes.collectionPosts,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return CollectionPostsScreen(
            collectionId: args['collectionId'] as String?,
            collection: args['collection'] as CollectionModel?,
          );
        },
      ),
      GoRoute(
        path: '/${Routes.audience}',
        name: Routes.audience,
        builder: (BuildContext context, GoRouterState state) {
          return const AudiencePage();
        },
      ),
      GoRoute(
        path: '/${Routes.creatorProfile}',
        name: Routes.creatorProfile,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return CreatorProfilePage(
            creatorModel: args['creatorModel'] as CreatorModel?,
            creatorUsername: args['creatorUsername'] as String? ?? '',
          );
        },
      ),
      GoRoute(
        path: '/${Routes.chat}',
        name: Routes.chat,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return ChatScreen(
            chat: args['chat'] as ChatItem,
          );
        },
      ),
      GoRoute(
        path: '/${Routes.groupChatDetails}',
        name: Routes.groupChatDetails,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return GroupChatDetailsScreen(
            chat: args['chat'] as ChatItem,
          );
        },
      ),
      GoRoute(
        path: '/${Routes.tos}',
        name: Routes.tos,
        builder: (BuildContext context, GoRouterState state) {
          return const TOSScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.privacyPolicy}',
        name: Routes.privacyPolicy,
        builder: (BuildContext context, GoRouterState state) {
          return const PrivacyPolicyScreen();
        },
      ),
      GoRoute(
        path: '/${Routes.messaging}',
        name: Routes.messaging,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return MessagingScreen(
            initialTabIndex: args['initialTabIndex'] as int? ?? 0,
          );
        },
      ),
      GoRoute(
        path: '/${Routes.joinMembership}',
        name: Routes.joinMembership,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return JoinMembershipScreen(
            membershipId: args['membershipId'] as String? ?? '',
            creatorId: args['creatorId'] as String? ?? '',
          );
        },
      ),
      GoRoute(
        path: '/${Routes.legal}',
        name: Routes.legal,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return LegalWebViewScreen(
            url: args['url'] as String? ?? '',
            title: args['title'] as String? ?? '',
          );
        },
      ),
      GoRoute(
        path: '/${Routes.createTextPost}',
        name: Routes.createTextPost,
        builder: (BuildContext context, GoRouterState state) {
          final PostModel? post = state.extra as PostModel?;
          return CreateTextPostScreen(post: post);
        },
      ),
      GoRoute(
        path: '/${Routes.createVideoPost}',
        name: Routes.createVideoPost,
        builder: (BuildContext context, GoRouterState state) {
          final PostModel? post = state.extra as PostModel?;
          return CreateVideoPostScreen(post: post);
        },
      ),
      GoRoute(
        path: '/${Routes.createAudioPost}',
        name: Routes.createAudioPost,
        builder: (BuildContext context, GoRouterState state) {
          final PostModel? post = state.extra as PostModel?;
          return CreateAudioPostScreen(post: post);
        },
      ),
      GoRoute(
        path: '/${Routes.createImagePost}',
        name: Routes.createImagePost,
        builder: (BuildContext context, GoRouterState state) {
          final PostModel? post = state.extra as PostModel?;
          return CreateImagePostScreen(post: post);
        },
      ),
      GoRoute(
        path: '/${Routes.createLinkPost}',
        name: Routes.createLinkPost,
        builder: (BuildContext context, GoRouterState state) {
          final PostModel? post = state.extra as PostModel?;
          return CreateLinkPostScreen(post: post);
        },
      ),
      GoRoute(
        path: '/${Routes.addEditDiscount}',
        name: Routes.addEditDiscount,
        builder: (BuildContext context, GoRouterState state) {
          final DiscountModel? discount = state.extra as DiscountModel?;
          return AddEditDiscountScreen(discount: discount);
        },
      ),
      GoRoute(
        path: '/${Routes.addEditGift}',
        name: Routes.addEditGift,
        builder: (BuildContext context, GoRouterState state) {
          final GiftModel? gift = state.extra as GiftModel?;
          return AddEditGiftScreen(gift: gift);
        },
      ),
      GoRoute(
        path: '/${Routes.publishCreator}',
        name: Routes.publishCreator,
        builder: (BuildContext context, GoRouterState state) {
          final String onboardingUrl = state.extra as String? ?? '';
          return PublishCreatorScreen(onboardingUrl: onboardingUrl);
        },
      ),
      GoRoute(
        path: '/${Routes.addEditAbout}',
        name: Routes.addEditAbout,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return AddEditAboutScreen(
            initialIntroVideo: args['initialIntroVideo'] as String? ?? '',
            initialBio: args['initialBio'] as String? ?? '',
            initialSocialLinks: args['initialSocialLinks'] as List<SocialLinkModel>? ?? [],
          );
        },
      ),
      GoRoute(
        path: '/${Routes.videoTrimmer}',
        name: Routes.videoTrimmer,
        builder: (BuildContext context, GoRouterState state) {
          final Map<String, dynamic> args = state.extra as Map<String, dynamic>? ?? {};
          return VideoTrimmerScreen(
            videoFile: args['videoFile'] as File,
            onTrimmed: args['onTrimmed'] as void Function(File),
          );
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('No route defined for ${state.uri.toString()}'),
      ),
    ),
  );
}
