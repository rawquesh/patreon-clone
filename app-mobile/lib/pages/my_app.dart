import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:patreon_clone/config/index.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/backend/audience/audience_provider.dart';
import 'package:patreon_clone/backend/collections/collection_provider.dart';
import 'package:patreon_clone/backend/creator/my_creator_provider.dart';
import 'package:patreon_clone/backend/insights_earnings_analytics/earnings_analytics_provider.dart';
import 'package:patreon_clone/backend/insights_memberships_analytics/membership_analytics_provider.dart';
import 'package:patreon_clone/backend/memberships/membership_provider.dart';
import 'package:patreon_clone/backend/payout/payout_provider.dart';
import 'package:patreon_clone/backend/promotions/gifts/gifts_provider.dart';
import 'package:patreon_clone/pages/tab_state.dart';
import 'package:overlay_support/overlay_support.dart';
import 'package:provider/provider.dart';
import 'package:responsive_builder/responsive_builder.dart';

import 'package:patreon_clone/backend/authentication/authentication_provider.dart';
import 'package:patreon_clone/styles/theme_provider.dart';
import 'package:patreon_clone/backend/common/dependency_injection.dart';
import 'package:patreon_clone/backend/insights_posts_analytics/posts_analytics_provider.dart';
import 'package:patreon_clone/backend/messaging/direct_message_provider.dart';
import 'package:patreon_clone/navigation/app_router.dart';
import 'package:patreon_clone/backend/notification/notification_provider.dart';
import 'package:patreon_clone/backend/post/liked_posts_provider.dart';
import 'package:patreon_clone/backend/post/post_provider.dart';
import 'package:patreon_clone/backend/post_creation/post_creation_provider.dart';
import 'package:patreon_clone/backend/promotions/discount_provider.dart';
import 'package:patreon_clone/pages/components/widgets/my_scroll_behaviour.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    MyPrint.printOnConsole("MyApp Build Called");

    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthenticationProvider>.value(value: DependencyInjection.authenticationProvider),
        ChangeNotifierProvider<AppThemeProvider>.value(value: DependencyInjection.appThemeProvider),
        ChangeNotifierProvider<PostProvider>.value(value: DependencyInjection.postProvider),
        ChangeNotifierProvider<MyCreatorProvider>.value(value: DependencyInjection.myCreatorProvider),
        ChangeNotifierProvider<DirectMessageProvider>.value(value: DependencyInjection.directMessageProvider),
        ChangeNotifierProvider<LikedPostsProvider>.value(value: DependencyInjection.likedPostsProvider),
        ChangeNotifierProvider<MyNotificationProvider>.value(value: DependencyInjection.myNotificationProvider),
        ChangeNotifierProvider<PostCreationProvider>.value(value: DependencyInjection.postCreationProvider),
        ChangeNotifierProvider<CollectionProvider>.value(value: DependencyInjection.collectionProvider),
        ChangeNotifierProvider<MembershipProvider>.value(value: DependencyInjection.membershipProvider),
        ChangeNotifierProvider<DiscountProvider>.value(value: DependencyInjection.discountProvider),
        ChangeNotifierProvider<GiftProvider>.value(value: DependencyInjection.giftProvider),
        ChangeNotifierProvider<MembershipAnalyticsProvider>.value(value: DependencyInjection.membershipAnalyticsProvider),
        ChangeNotifierProvider<EarningsAnalyticsProvider>.value(value: DependencyInjection.earningsAnalyticsProvider),
        ChangeNotifierProvider<PostsAnalyticsProvider>.value(value: DependencyInjection.postsAnalyticsProvider),
        ChangeNotifierProvider<PayoutProvider>.value(value: DependencyInjection.payoutProvider),
        ChangeNotifierProvider<AudienceProvider>.value(value: DependencyInjection.audienceProvider),
        ChangeNotifierProvider<TabState>.value(value: DependencyInjection.tabState),
      ],
      child: const MainApp(),
    );
  }
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    MyPrint.printOnConsole("MainApp Build Called");

    return OverlaySupport.global(
      child: Consumer<AppThemeProvider>(
        builder: (BuildContext context, AppThemeProvider appThemeProvider, Widget? child) {
          return ResponsiveBuilder(
            builder: (context, sizingInformation) {
              return MaterialApp.router(
                debugShowCheckedModeBanner: false,
                routerConfig: AppRouter.router,
                title: AppConfig.appName,
                theme: appThemeProvider.getThemeData(),
                builder: (BuildContext context, Widget? child) {
                  final mq = MediaQuery.of(context);
                  return MediaQuery(
                    data: mq.copyWith(textScaler: TextScaler.noScaling),
                    child: ScrollConfiguration(
                      behavior: const MyScrollBehavior(),
                      child: AnnotatedRegion(
                        value: SystemUiOverlayStyle.dark,
                        child: child ?? const SizedBox(),
                      ),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
