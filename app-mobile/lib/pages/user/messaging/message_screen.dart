import 'package:flutter/material.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';

import 'package:patreon_clone/pages/components/widgets/messaging_app_bar.dart';
import 'components/community_chats_tab.dart';
import 'components/direct_message_tab.dart';

class MessagingScreen extends StatefulWidget {
  final PreferredSizeWidget? appBar;
  final TabController? controller;
  final int initialTabIndex;

  const MessagingScreen({
    super.key,
    this.appBar,
    this.controller,
    this.initialTabIndex = 0,
  });

  @override
  State<MessagingScreen> createState() => _MessagingScreenState();
}

class _MessagingScreenState extends State<MessagingScreen> with SingleTickerProviderStateMixin, MySafeState {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = widget.controller ?? TabController(length: 2, vsync: this, initialIndex: widget.initialTabIndex);
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _tabController.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Scaffold(
      appBar: widget.appBar ??
          MessagingAppBar(
            tabController: _tabController,
            themeData: themeData,
          ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          CommunityChatsTab(),
          DirectMessagesTab(),
        ],
      ),
    );
  }
}
