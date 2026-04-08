import 'package:flutter/material.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/creator/promotions/tabs/discount_tab_screen.dart';
import 'package:patreon-clone/pages/creator/promotions/tabs/gifts_tab_screen.dart';

class PromotionsScreen extends StatefulWidget {
  const PromotionsScreen({super.key});

  @override
  State<PromotionsScreen> createState() => _PromotionsScreenState();
}

class _PromotionsScreenState extends State<PromotionsScreen> with SingleTickerProviderStateMixin, MySafeState {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(
          'Promotions',
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
          preferredSize: const Size.fromHeight(30),
          child: Container(
            color: themeData.primaryColor,
            child: TabBar(
              controller: _tabController,
              indicatorColor: Colors.white,
              indicatorWeight: 3,
              labelColor: themeData.colorScheme.onPrimary,
              dividerColor: Colors.transparent,
              unselectedLabelColor: themeData.colorScheme.onPrimary.withValues(alpha: 0.7),
              labelStyle: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
              unselectedLabelStyle: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.normal,
                color: themeData.colorScheme.onPrimary.withValues(alpha: 0.4),
              ),
              tabs: const [
                Tab(text: 'Discounts'),
                Tab(text: 'Gifts'),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          DiscountTabScreen(),
          GiftTabScreen(),
        ],
      ),
    );
  }
}
