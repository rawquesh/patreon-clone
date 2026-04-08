import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/creator/audience/audience_page.dart';
import 'package:patreon-clone/pages/creator/insights/insights_screen.dart';
import 'package:patreon-clone/pages/creator/library/library_screen.dart';
import 'package:patreon-clone/pages/creator/notification/notification_listing_screen.dart';
import 'package:patreon-clone/pages/creator/payout/payout_screen.dart';
import 'package:patreon-clone/pages/creator/promotions/promotions_screen.dart';
import 'package:patreon-clone/pages/creator/settings/settings_screen.dart';
import 'package:patreon-clone/pages/user/messaging/message_screen.dart';

import 'package:patreon-clone/pages/creator/main/my_creator_page.dart';
import 'package:patreon-clone/pages/user/home/components/account_switcher_sheet.dart';

class CreatorMainScreen extends StatefulWidget {
  static const String routeName = "/CreatorMainScreen";

  const CreatorMainScreen({super.key});

  @override
  State<CreatorMainScreen> createState() => _CreatorMainScreenState();
}

class _CreatorMainScreenState extends State<CreatorMainScreen>
    with TickerProviderStateMixin, MySafeState, WidgetsBindingObserver {
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  late Animation<double> _fadeAnimation;
  late TabController _messagingTabController;

  bool _isSidebarOpen = false;
  bool _isFullyExpanded = true;
  int _selectedIndex = 0;

  List<SidebarItem> _sidebarItems() {
    return [
      SidebarItem(icon: CupertinoIcons.house_fill, label: "Home"),
      SidebarItem(icon: CupertinoIcons.book_fill, label: "Library"),
      SidebarItem(icon: CupertinoIcons.person_2_fill, label: "Audience"),
      SidebarItem(icon: CupertinoIcons.chart_bar_fill, label: "Insights"),
      SidebarItem(icon: CupertinoIcons.creditcard_fill, label: "Payouts"),
      SidebarItem(icon: Icons.campaign_outlined, label: "Promotions"),
      SidebarItem(icon: CupertinoIcons.person_3_fill, label: "Messages"),
      SidebarItem(icon: CupertinoIcons.bell_fill, label: "Notifications"),
      SidebarItem(icon: CupertinoIcons.settings_solid, label: "Settings"),
    ];
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _messagingTabController = TabController(length: 2, vsync: this);

    _slideAnimation = Tween<double>(begin: -1.0, end: 0.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 0.5).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _animationController.dispose();
    _messagingTabController.dispose();
    super.dispose();
  }

  void _toggleSidebar() {
    setState(() {
      _isSidebarOpen = !_isSidebarOpen;
      // if (!_isSidebarOpen) _isFullyExpanded = false;
    });

    if (_isSidebarOpen) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  void _toggleExpansion() {
    setState(() {
      _isFullyExpanded = !_isFullyExpanded;
    });
  }

  void _selectItem(int index) {
    setState(() {
      _selectedIndex = index;
    });
    _toggleSidebar();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    UserModel userModel = DependencyInjection.authenticationProvider.userModel.get() ?? UserModel();

    final List<Widget> screens = [
      const MyCreatorPage(),
      const LibraryScreen(),
      const AudiencePage(),
      const InsightsScreen(),
      const PayoutScreen(),
      const PromotionsScreen(),
      MessagingScreen(
        controller: _messagingTabController,
        appBar: AppBar(
          automaticallyImplyLeading: false,
          title: Text(
            'Creator Messages',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: themeData.colorScheme.onPrimary,
              letterSpacing: -0.5,
            ).withTiempos,
          ),
          backgroundColor: themeData.primaryColor,
          elevation: 0,
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(kToolbarHeight + 10),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
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
                      color: Colors.black.withValues(alpha: 0.06),
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
          ),
        ),
      ),
      const NotificationListingScreen(),
      const SettingsScreen(),
    ];

    super.pageBuild();
    return Scaffold(
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: IndexedStack(
                  index: _selectedIndex,
                  children: screens,
                ),
              ),
            ],
          ),
          if (_isSidebarOpen)
            AnimatedBuilder(
              animation: _fadeAnimation,
              builder: (context, child) {
                return Opacity(
                  opacity: _fadeAnimation.value,
                  child: GestureDetector(
                    onTap: _toggleSidebar,
                    child: Container(
                      color: Colors.black,
                      width: double.infinity,
                      height: double.infinity,
                    ),
                  ),
                );
              },
            ),
          Positioned(
            top: 10 + MediaQuery.of(context).padding.top,
            left: 15,
            child: Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
                borderRadius: BorderRadius.circular(8),
              ),
              child: IconButton(
                icon: const Icon(Icons.menu, color: Colors.black),
                onPressed: _toggleSidebar,
              ),
            ),
          ),
          AnimatedBuilder(
            animation: _slideAnimation,
            builder: (context, child) {
              double sidebarWidth = _isFullyExpanded ? 280 : 150;
              return Transform.translate(
                offset: Offset(_slideAnimation.value * sidebarWidth, 0),
                child: ModernOverlaySidebar(
                  items: _sidebarItems(),
                  selectedIndex: _selectedIndex,
                  isFullyExpanded: _isFullyExpanded,
                  onItemTap: _selectItem,
                  onExpandTap: _toggleExpansion,
                  userModel: userModel,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class SidebarItem {
  final IconData icon;
  final String label;

  SidebarItem({required this.icon, required this.label});
}

class ModernOverlaySidebar extends StatelessWidget {
  final List<SidebarItem> items;
  final int selectedIndex;
  final bool isFullyExpanded;
  final Function(int) onItemTap;
  final VoidCallback onExpandTap;
  final UserModel userModel;

  const ModernOverlaySidebar({
    super.key,
    required this.items,
    required this.selectedIndex,
    required this.isFullyExpanded,
    required this.onItemTap,
    required this.onExpandTap,
    required this.userModel,
  });

  @override
  Widget build(BuildContext context) {
    double sidebarWidth = isFullyExpanded ? 280 : 100;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      width: sidebarWidth,
      height: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(2, 0),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            // height: MediaQuery.of(context).size.width * 0.40,
            width: double.infinity,
            padding: const EdgeInsets.all(10).copyWith(top: MediaQuery.of(context).padding.top + 10),
            color: Theme.of(context).primaryColor,
            alignment: Alignment.center,
            child: GestureDetector(
              onLongPress: () async {
                HapticFeedback.selectionClick();
                AccountSwitcherSheet.show(context);
              },
              child: Column(
                children: [
                  Container(
                    height: 70,
                    width: 70,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white,
                        width: 2,
                      ),
                    ),
                    child: CommonCachedNetworkImage(
                      imageUrl: userModel.profilePicture,
                      width: sidebarWidth,
                      fit: BoxFit.cover,
                      borderRadius: 48,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    userModel.displayName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ).withEpilogue,
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
              children: [
                ...items.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
                  final isSelected = index == selectedIndex;

                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    child: InkWell(
                      onTap: () => onItemTap(index),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        height: 50,
                        padding: const EdgeInsets.symmetric(horizontal: 15),
                        child: Row(
                          children: [
                            Icon(
                              item.icon,
                              color: isSelected ? Theme.of(context).primaryColor : Colors.grey.withOpacity(0.7),
                              size: 24,
                            ),
                            if (isFullyExpanded) ...[
                              const SizedBox(width: 15),
                              Expanded(
                                child: Text(
                                  item.label,
                                  style: TextStyle(
                                    color: isSelected ? Theme.of(context).primaryColor : Colors.grey.shade500,
                                    fontSize: 16,
                                    fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 15),
                if (isFullyExpanded)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: OutlinedButton(
                      onPressed: () {
                        HapticFeedback.selectionClick();
                        AccountSwitcherSheet.show(context);
                      },
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        side: BorderSide(color: Theme.of(context).primaryColor),
                      ),
                      child: const Text('Switch account'),
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0).copyWith(bottom: MediaQuery.of(context).padding.bottom + 8),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 2),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: Theme.of(context).primaryColor,
              ),
              child: IconButton(
                icon: Icon(
                  isFullyExpanded ? Icons.chevron_left : Icons.chevron_right,
                  color: Colors.white,
                  size: 34,
                ),
                onPressed: onExpandTap,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
