import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:patreon_clone/constants/shared_preference_constants.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/managers/shared_pref_manager.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon_clone/backend/messaging/direct_message_controller.dart';
import 'package:patreon_clone/backend/messaging/direct_message_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';
import 'create_group_chat_dialog.dart';
import 'group_chat_list_item.dart';

class CommunityChatsTab extends StatefulWidget {
  const CommunityChatsTab({super.key});

  @override
  State<CommunityChatsTab> createState() => _CommunityChatsTabState();
}

class _CommunityChatsTabState extends State<CommunityChatsTab> with MySafeState {
  bool _isCreatorMode = false;
  String? _currentUserId; // <-- add this

  late DirectMessageProvider provider;
  late DirectMessageController controller;
  TextEditingController searchController = TextEditingController();
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    provider = context.read<DirectMessageProvider>();
    controller = DirectMessageController(provider: provider);
    _loadInitialData();
    _loadMode();
    _loadUserId(); // <-- add this
  }

  Future<void> _loadMode() async {
    _isCreatorMode = await SharedPrefManager().getBool(SharedPreferenceConstants.isCreatorMode) ?? false;
    mySetState();
  }

  Future<void> _loadUserId() async {
    _currentUserId = await SharedPrefManager().getString(SharedPreferenceConstants.userId);
    mySetState();
  }

  void _loadInitialData() {
    setState(() => isLoading = true);

    if (provider.groupChats.length == 0) {
      controller.getGroupChats(isRefresh: true, isFromCache: false, isNotify: true);
    } else {
      controller.getGroupChats(isRefresh: false, isFromCache: true, isNotify: false);
    }

    setState(() => isLoading = false);
  }

  void _refreshChats() {
    controller.getGroupChats(isRefresh: true, isFromCache: false, isNotify: true);
  }

  void _showCreateGroupChatDialog() {
    showDialog(
      context: context,
      builder: (context) => const CreateGroupChatDialog(),
    );
  }

  String formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 0) {
      return '${difference.inDays}d';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    } else {
      return 'now';
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      body: Consumer<DirectMessageProvider>(
        builder: (context, provider, child) {
          final allGroupChats = provider.groupChats.getList();

          if (isLoading) return _buildLoadingState();
          if (allGroupChats.isEmpty) return _buildEmptyState(_isCreatorMode);

          // Hide chats where I'm the creator when NOT in creator mode
          final visibleGroupChats = (!_isCreatorMode && _currentUserId != null)
              ? allGroupChats.where((c) => c.creator.userId != _currentUserId).toList()
              : allGroupChats;

          visibleGroupChats.sort((a, b) {
            final aDate = a.lastMessage?.createdAt;
            final bDate = b.lastMessage?.createdAt;

            if (aDate == null && bDate == null) return 0;
            if (aDate == null) return 1;
            if (bDate == null) return -1;
            return bDate.compareTo(aDate);
          });

          // Optional: debug log
          MyPrint.printOnConsole('CommunityChatsTab: isCreatorMode=$_isCreatorMode, '
              'currentUserId=$_currentUserId, '
              'total=${allGroupChats.length}, visible=${visibleGroupChats.length}');

          if (visibleGroupChats.isEmpty) return _buildEmptyState(_isCreatorMode);

          return RefreshIndicator(
            onRefresh: () async => _refreshChats(),
            color: const Color(0xFF4A90E2),
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: visibleGroupChats.length,
              separatorBuilder: (context, index) => const Divider(
                height: 1,
                color: Color(0xFFE5E5EA),
                indent: 78,
              ),
              itemBuilder: (context, index) {
                final chat = visibleGroupChats[index];

                MyPrint.printOnConsole('CommunityChatsTab: Building chat item for ${chat.otherUser.toString()}');

                return GroupChatListItem(
                  chat: chat,
                  onTap: () {
                    context.pushNamed(
                      Routes.chat,
                      extra: {'chat': chat},
                    ).then((_) => _refreshChats());
                  },
                  formatTime: formatTime,
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: _isCreatorMode
          ? FloatingActionButton(
              onPressed: _showCreateGroupChatDialog,
              backgroundColor: themeData.primaryColor,
              tooltip: 'Create Group Chat',
              child: const Icon(
                CupertinoIcons.person_3,
                color: Colors.white,
                size: 32,
              ),
            )
          : null,
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(
            width: 32,
            height: 32,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4A90E2)),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Loading conversations...',
            style: const TextStyle(
              fontSize: 15,
              color: Color(0xFF8E8E93),
              fontWeight: FontWeight.w500,
            ).withEpilogue,
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isCreatorMode) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.forum_outlined,
            size: 64,
            color: Color(0xFFD1D1D6),
          ),
          const SizedBox(height: 16),
          Text(
            'No community chats yet',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF48484A),
            ).withEpilogue,
          ),
          const SizedBox(height: 8),
          Text(
            isCreatorMode
                ? 'Create a new group to start chatting'
                : 'This is where group chats with creators you subscribe to will live',
            style: const TextStyle(
              fontSize: 15,
              color: Color(0xFF8E8E93),
              fontWeight: FontWeight.w500,
            ).withEpilogue,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
