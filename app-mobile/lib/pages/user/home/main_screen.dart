// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';

import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/user/explore/explore_screen.dart';
import 'package:patreon-clone/pages/user/messaging/message_screen.dart';
import 'package:patreon-clone/pages/user/notification/notification_screen.dart';
import 'package:patreon-clone/pages/user/profile/profile_screen.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/pages/components/widgets/flashy_tab_bar.dart';
import 'package:patreon-clone/pages/tab_state.dart';
import 'package:patreon-clone/pages/user/home/components/account_switcher_sheet.dart';
import 'package:patreon-clone/pages/user/home/components/custom_bottom_bar.dart';
import 'home_screen.dart';

class MainScreen extends StatefulWidget {
  static const String routeName = "/MainScreen";
  final bool forceRefresh;

  const MainScreen({super.key, this.forceRefresh = false});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> with SingleTickerProviderStateMixin, MySafeState, WidgetsBindingObserver {
  late TabController _messagingTabController;
  late bool _shouldRefreshHome;

  @override
  void initState() {
    super.initState();
    _shouldRefreshHome = widget.forceRefresh;
    WidgetsBinding.instance.addObserver(this);
    _messagingTabController = TabController(length: 2, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final tabState = context.read<TabState>();
      tabState.addListener(() {
        if (tabState.currentIndex == HomePageTabs.community) {
          // Index for the 'Chats' tab
          _messagingTabController.animateTo(tabState.messagingTabIndex);
        }
      });
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _messagingTabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    UserModel userModel = DependencyInjection.authenticationProvider.userModel.get() ?? UserModel();

    final List<Widget> screens = [
      // Pass the state variable to HomeScreen.
      HomeScreen(forceRefresh: _shouldRefreshHome),
      const ExploreScreen(),
      MessagingScreen(
        controller: _messagingTabController,
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(140),
          child: Container(
            padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
            decoration: BoxDecoration(
              // color: Colors.white,
              color: themeData.scaffoldBackgroundColor,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  offset: const Offset(0, 1),
                  blurRadius: 8,
                ),
              ],
            ),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                  child: Row(
                    children: [
                      Text(
                        'Messages',
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: Colors.black,
                          letterSpacing: -0.5,
                        ).withTiempos,
                      ),
                    ],
                  ),
                ),
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8F9FA),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: TabBar(
                    controller: _messagingTabController,
                    labelColor: themeData.primaryColor,
                    unselectedLabelColor: const Color(0xFF8E8E93),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    indicator: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          offset: const Offset(0, 2),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    labelStyle: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ).withEpilogue,
                    unselectedLabelStyle: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ).withEpilogue,
                    tabs: const [
                      Tab(text: 'Chats'),
                      Tab(text: 'Direct Messages'),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
      const NotificationScreen(),
      const ProfileScreen(),
    ];

    // Consume the flag after the build.
    if (_shouldRefreshHome) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() {
            _shouldRefreshHome = false;
          });
        }
      });
    }

    // const double iconSize = 26.0;
    // const double fontSize = 13.0;

    return ChangeNotifierProvider(
      create: (_) => TabState(),
      child: Consumer<TabState>(
        builder: (context, tabState, _) {
          final currentIndex = tabState.currentIndex;

          return PopScope(
            canPop: currentIndex == 0,
            onPopInvoked: (didPop) {
              if (didPop) {
                return;
              }
              if (currentIndex != 0) {
                context.read<TabState>().setTab(0);
              }
            },
            child: Scaffold(
              body: screens[currentIndex],
              bottomNavigationBar: FlashyTabBar(
                animationDuration: const Duration(milliseconds: 500),
                selectedIndex: currentIndex,
                onItemSelected: (index) => context.read<TabState>().setTab(index),
                showElevation: true,
                items: [
                  FlashyTabBarItem(
                    icon: const Icon(Icons.home, size: 26),
                    title: Text('Home',
                        style: themeData.textTheme.labelSmall
                            ?.copyWith(fontSize: 13, color: themeData.primaryColor, fontWeight: FontWeight.bold)
                            .withEpilogue),
                    activeColor: themeData.primaryColor,
                    inactiveColor: themeData.primaryColor.withOpacity(0.4),
                  ),
                  FlashyTabBarItem(
                    icon: const Icon(Icons.explore, size: 26),
                    title: Text('Explore',
                        style:
                            themeData.textTheme.labelSmall?.copyWith(fontSize: 13, color: themeData.primaryColor).withEpilogue),
                    activeColor: themeData.primaryColor,
                    inactiveColor: themeData.primaryColor.withOpacity(0.4),
                  ),
                  FlashyTabBarItem(
                    icon: const Icon(Icons.group, size: 26),
                    title: Text('Chats',
                        style:
                            themeData.textTheme.labelSmall?.copyWith(fontSize: 13, color: themeData.primaryColor).withEpilogue),
                    activeColor: themeData.primaryColor,
                    inactiveColor: themeData.primaryColor.withOpacity(0.4),
                  ),
                  FlashyTabBarItem(
                    icon: const Icon(Icons.notifications, size: 26),
                    title: Text('Alerts',
                        style:
                            themeData.textTheme.labelSmall?.copyWith(fontSize: 13, color: themeData.primaryColor).withEpilogue),
                    activeColor: themeData.primaryColor,
                    inactiveColor: themeData.primaryColor.withOpacity(0.4),
                  ),
                  FlashyTabBarItem(
                    icon: GestureDetector(
                      onTap: () => context.read<TabState>().setTab(4),
                      onLongPress: () async {
                        await HapticFeedback.selectionClick();
                        AccountSwitcherSheet.show(context);
                      },
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: currentIndex == 4 ? themeData.primaryColor : Colors.transparent,
                            width: 1.5,
                          ),
                        ),
                        child: CircleAvatar(
                          radius: 13,
                          backgroundImage: userModel.profilePicture.isNotEmpty ? NetworkImage(userModel.profilePicture) : null,
                          backgroundColor: themeData.primaryColor.withOpacity(0.1),
                          child: userModel.profilePicture.isEmpty
                              ? Icon(Icons.person, size: 26 * 0.7, color: themeData.primaryColor)
                              : null,
                        ),
                      ),
                    ),
                    title: const SizedBox.shrink(),
                    activeColor: themeData.primaryColor,
                    inactiveColor: themeData.primaryColor.withOpacity(0.4),
                    disableAnimation: true,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
