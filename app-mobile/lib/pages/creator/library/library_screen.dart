import 'package:flutter/material.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/creator/library/tabs/collections_tab_screen.dart';
import 'package:patreon-clone/pages/creator/library/tabs/posts_list_tab.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> with SingleTickerProviderStateMixin, MySafeState {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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
      appBar: AppBar(
        title: Text(
          'Library',
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
                Tab(text: 'Posts'),
                Tab(text: 'Collections'),
                Tab(text: 'Drafts'),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          PostsListTab(postListType: PostListType.published),

          CollectionsTabScreen(),
          // Use the same widget for drafts
          PostsListTab(postListType: PostListType.drafts),
        ],
      ),
    );
  }
}

class DraftsTabScreen extends StatelessWidget {
  const DraftsTabScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'Drafts Tab Content',
        style: TextStyle(fontSize: 18),
      ),
    );
  }
}
