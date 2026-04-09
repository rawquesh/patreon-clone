import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:patreon-clone/config/index.dart';
import 'package:patreon-clone/utils/extensions.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/pages/tab_state.dart';

class StockStriveAppBar extends StatelessWidget implements PreferredSizeWidget {
  final TabController tabController;

  const StockStriveAppBar({
    super.key,
    required this.tabController,
  });

  @override
  Size get preferredSize => const Size.fromHeight(160);

  @override
  Widget build(BuildContext context) {
    final ThemeData themeData = Theme.of(context);

    bool isScrollable = context.sizeData.width < 400;

    return Container(
      decoration: BoxDecoration(
        color: themeData.colorScheme.primary,
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xff0E791B), Color(0xff16AA27)],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 15.0),
              child: Row(
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () {},
                        child: CircleAvatar(
                          backgroundColor: Colors.transparent,
                          child: ClipOval(
                            child: Image.network(
                              AppConfig.placeholderImageUrl,
                              width: 35,
                              height: 35,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        AppConfig.appName,
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          color: themeData.colorScheme.onPrimary,
                          fontSize: 24,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  // Action buttons
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.account_balance_wallet, color: Colors.white),
                        onPressed: () {},
                      ),
                      IconButton(
                        icon: const Icon(Icons.notifications, color: Colors.white),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Container(
                height: 35, // Reduced height
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: TabBar(
                  onTap: (_) {
                    // ignore: invalid_use_of_protected_member, invalid_use_of_visible_for_testing_member
                    context.read<TabState>().notifyListeners();
                  },
                  padding: EdgeInsets.zero,
                  indicatorPadding: EdgeInsets.zero,
                  labelPadding: EdgeInsets.zero,
                  // indicatorWeight: 2,
                  isScrollable: isScrollable,
                  tabAlignment: isScrollable ? TabAlignment.start : null,
                  controller: tabController,
                  indicator: BoxDecoration(
                    // color: const Color(0xff38BD47),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  dividerColor: Colors.transparent,
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: Colors.white,
                  unselectedLabelColor: Colors.white,
                  tabs: [
                    Tab(
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xff38BD47), width: 1),
                          color: tabController.index == 0 ? const Color(0xff38BD47) : null,
                        ),
                        child: Align(
                          alignment: Alignment.center,
                          child: Text(
                            "Contest",
                            style: themeData.textTheme.labelMedium?.copyWith(
                              fontSize: 16,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Tab(
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xff38BD47), width: 1),
                          color: tabController.index == 1 ? const Color(0xff38BD47) : null,
                        ),
                        child: Align(
                          alignment: Alignment.center,
                          child: Text(
                            "My Contest",
                            style: themeData.textTheme.labelMedium?.copyWith(
                              fontSize: 16,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Tab(
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xff38BD47), width: 1),
                          color: tabController.index == 2 ? const Color(0xff38BD47) : null,
                        ),
                        child: Align(
                          alignment: Alignment.center,
                          child: Text(
                            "Teams",
                            style: themeData.textTheme.labelMedium?.copyWith(
                              fontSize: 16,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Tab(
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xff38BD47), width: 1),
                          color: tabController.index == 3 ? const Color(0xff38BD47) : null,
                        ),
                        child: Align(
                          alignment: Alignment.center,
                          child: Text(
                            "Stats",
                            style: themeData.textTheme.labelMedium?.copyWith(
                              fontSize: 16,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
