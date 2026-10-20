import 'package:flutter/material.dart';
import 'package:patreon_clone/config/index.dart';
import 'package:patreon_clone/styles/styles.dart';
import 'package:patreon_clone/styles/font_manager.dart';

class MessagingAppBar extends StatelessWidget implements PreferredSizeWidget {
  final TabController tabController;
  final ThemeData themeData;

  const MessagingAppBar({
    super.key,
    required this.tabController,
    required this.themeData,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      decoration: BoxDecoration(
        color: Styles.scaffoldBackground,
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
                    color: Color(0xFF1A1A1A),
                    letterSpacing: -0.5,
                  ).withTiempos,
                ),
              ],
            ),
          ),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              color: Styles.scaffoldBackground,
              borderRadius: BorderRadius.circular(10),
            ),
            child: TabBar(
              controller: tabController,
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
                Tab(text: AppConfig.communityTabLabel),
                Tab(text: 'Direct Messages'),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(140);
}
