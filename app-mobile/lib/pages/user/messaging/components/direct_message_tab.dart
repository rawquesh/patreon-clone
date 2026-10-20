import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:patreon_clone/constants/shared_preference_constants.dart';
import 'package:patreon_clone/models/audience/subscriber.dart';
import 'package:patreon_clone/models/chat/chat_model.dart';
import 'package:patreon_clone/models/user/data_model/user_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/utils/my_toast.dart';
import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/managers/shared_pref_manager.dart';
import 'package:patreon_clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon_clone/styles/font_manager.dart';

import 'package:patreon_clone/backend/messaging/direct_message_controller.dart';
import 'package:patreon_clone/backend/messaging/direct_message_provider.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';

import 'subscriber_search_delegate.dart';
import 'chat_list_item.dart';

class DirectMessagesTab extends StatefulWidget {
  const DirectMessagesTab({super.key});

  @override
  State<DirectMessagesTab> createState() => _DirectMessagesTabState();
}

class _DirectMessagesTabState extends State<DirectMessagesTab> with MySafeState {
  late DirectMessageProvider provider;
  late DirectMessageController controller;
  TextEditingController searchController = TextEditingController();

  bool _isBootLoading = true;
  bool _isCreatorMode = false;
  String _loginSessionId = '';

  String _query = '';
  Timer? _debounce;

  void _onSearchChanged() {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 200), () {
      if (!mounted) return;
      _query = searchController.text;
      mySetState();
    });
  }

  String _norm(String s) {
    final lower = s.toLowerCase().trim();
    final replaced = lower
        .replaceAll(RegExp(r'[àáâãäå]'), 'a')
        .replaceAll(RegExp(r'[èéêë]'), 'e')
        .replaceAll(RegExp(r'[ìíîï]'), 'i')
        .replaceAll(RegExp(r'[òóôõöø]'), 'o')
        .replaceAll(RegExp(r'[ùúûü]'), 'u')
        .replaceAll(RegExp(r'[ç]'), 'c')
        .replaceAll(RegExp(r'\s+'), ' ');
    return replaced;
  }

  bool _containsAllTokens(String haystack, List<String> tokens) {
    for (final t in tokens) {
      if (t.isEmpty) continue;
      if (!haystack.contains(t)) return false;
    }
    return true;
  }

  List<ChatItem> _applySearch(List<ChatItem> all) {
    final q = _norm(_query);
    if (q.isEmpty) return all;

    final tokens = q.split(' ');

    return all.where((c) {
      final name = c.otherUser.displayName;
      final lastMsg = c.lastMessage?.content ?? '';
      final extra = c.chat.lastMessage;
      final haystack = _norm('$name $lastMsg $extra');
      return _containsAllTokens(haystack, tokens);
    }).toList();
  }

  void _loadInitialData() {
    _isBootLoading = true;
    mySetState();

    if (provider.chats.length == 0) {
      controller.getChats(isRefresh: true, isFromCache: false, isNotify: true);
    } else {
      controller.getChats(isRefresh: false, isFromCache: true, isNotify: false);
    }

    _isBootLoading = false;
    mySetState();
  }

  Future<void> _refreshChats() async {
    await controller.getChats(isRefresh: true, isFromCache: false, isNotify: true);
    if (!mounted) return;
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

  Future<void> _loadMode() async {
    _isCreatorMode = await SharedPrefManager().getBool(SharedPreferenceConstants.isCreatorMode) ?? false;

    mySetState();
  }

  Future<void> _loadSessionId() async {
    _loginSessionId = await SharedPrefManager().getString(SharedPreferenceConstants.userId) ?? MyUtils.getNewId();
    mySetState();
  }

  @override
  void initState() {
    super.initState();
    provider = context.read<DirectMessageProvider>();
    controller = DirectMessageController(provider: provider);
    _loadInitialData();
    _loadMode();
    _loadSessionId();
    searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    searchController.dispose();
    super.dispose();
  }

  List<ChatItem> _filterBySection(List<ChatItem> all) {
    final uid = _loginSessionId;
    if (uid.isEmpty) return all;

    if (_isCreatorMode) {
      return all.where((c) {
        final creatorIdFromItem = c.creator.userId;
        final creatorIdFromModel = c.chat.creator;
        return creatorIdFromItem == uid || creatorIdFromModel == uid;
      }).toList();
    } else {
      return all.where((c) {
        final amParticipant = (((c.chat.participants as List).contains(uid)) || c.allParticipants.any((p) => p.userId == uid));

        final isCreatorMe = (c.creator.userId == uid) || (c.chat.creator == uid);

        return amParticipant && !isCreatorMe;
      }).toList();
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return ModalProgressHUD(
      inAsyncCall: _isBootLoading,
      child: Scaffold(
        floatingActionButton: _isCreatorMode
            ? FloatingActionButton(
                onPressed: () async {
                  Subscriber? subscriber = await showSearch<Subscriber?>(
                    context: context,
                    delegate: SubscriberSearchDelegate(controller),
                  );

                  MyPrint.printOnConsole(
                      "Direct Message tap Tapped subscriber: ${subscriber?.subscriberId} ${subscriber?.firstName} ${subscriber?.lastName} (${subscriber?.email}) ${subscriber.toString()}");

                  String creatorId = await SharedPrefManager().getString(SharedPreferenceConstants.userId) ?? '';

                  if (subscriber != null) {
                    ChatModel? chat = await controller.createDirectChat(subscriber.subscriberId, creatorId);

                    UserModel userModel = UserModel(
                      userId: subscriber.subscriberId,
                      displayName: '${subscriber.firstName} ${subscriber.lastName}',
                      profilePicture: subscriber.profilePicture,
                    );

                    if (chat != null && mounted) {
                      Navigator.pop(context); // Close search dialog
                      context.pushNamed(
                        Routes.chat,
                        extra: {
                          'chat': ChatItem(
                            chat: chat,
                            otherUser: userModel,
                            creator: UserModel(
                              userId: creatorId,
                            ),
                            allParticipants: [],
                          )
                        },
                      );
                    } else if (mounted) {
                      MyToast.showError(context: context, msg: "Could not start chat. Please try again.");
                    }
                  }
                },
                backgroundColor: themeData.primaryColor,
                tooltip: 'New Message',
                child: const Icon(
                  CupertinoIcons.search,
                  color: Colors.white,
                ),
              )
            : null,
        body: Column(
          children: [
            Container(
              margin: const EdgeInsets.fromLTRB(20, 12, 20, 16),
              child: TextField(
                controller: searchController,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500).withEpilogue,
                decoration: InputDecoration(
                  hintText: 'Search conversations...',
                  hintStyle: const TextStyle(color: Color(0xFF8E8E93), fontWeight: FontWeight.w500).withEpilogue,
                  prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF8E8E93), size: 22),
                  suffixIcon: (_query.isEmpty)
                      ? null
                      : IconButton(
                          icon: const Icon(Icons.close_rounded, size: 18, color: Color(0xFF8E8E93)),
                          onPressed: () {
                            searchController.clear();
                          },
                        ),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  filled: true,
                  fillColor: const Color(0xFFF2F2F7),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
            ),
            Expanded(
              child: Consumer<DirectMessageProvider>(
                builder: (context, provider, child) {
                  final all = provider.chats.getList();
                  final filtered = _filterBySection(all);
                  final chats = _applySearch(filtered);

                  chats.sort((a, b) {
                    final aDate = a.lastMessage?.createdAt;
                    final bDate = b.lastMessage?.createdAt;

                    if (aDate == null && bDate == null) return 0;
                    if (aDate == null) return 1;
                    if (bDate == null) return -1;

                    return bDate.compareTo(aDate);
                  });

                  if (all.isEmpty) {
                    return _buildEmptyState(_isCreatorMode);
                  }

                  if (chats.isEmpty && _query.isNotEmpty) {
                    return _buildNoResultsState(_query);
                  }

                  return RefreshIndicator(
                    onRefresh: () async => _refreshChats(),
                    color: const Color(0xFF4A90E2),
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: chats.length,
                      separatorBuilder: (context, index) => const Divider(
                        height: 1,
                        color: Color(0xFFE5E5EA),
                        indent: 78,
                      ),
                      itemBuilder: (context, index) {
                        final chat = chats[index];
                        return ChatListItem(
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
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoResultsState(String q) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off_rounded, size: 64, color: Color(0xFFD1D1D6)),
            const SizedBox(height: 16),
            Text(
              'No matches for “$q”',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF48484A)).withEpilogue,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Try a different name or keyword from the last message.',
              style: const TextStyle(fontSize: 15, color: Color(0xFF8E8E93), fontWeight: FontWeight.w500).withEpilogue,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => searchController.clear(),
              child: Text(
                'Clear search',
                style: themeData.textTheme.bodyMedium
                    ?.copyWith(color: themeData.primaryColor, fontWeight: FontWeight.bold)
                    .withEpilogue,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /*Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
         LoadingWidget(
           boxSize: 50,
           loaderSize: 40,
         ),
          SizedBox(height: 16),
          Text(
            'Loading messages...',
            style: TextStyle(
              fontSize: 15,
              color: Color(0xFF8E8E93),
              fontWeight: FontWeight.w500,
            ).withEpilogue,
          ),
        ],
      ),
    );
  }*/

  Widget _buildEmptyState(bool isCreatorMode) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.chat_bubble_outline_rounded,
            size: 64,
            color: Color(0xFFD1D1D6),
          ),
          const SizedBox(height: 16),
          Text(
            'No messages yet',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF48484A),
            ).withEpilogue,
          ),
          const SizedBox(height: 8),
          Text(
            isCreatorMode
                ? 'Start a conversation with a creator'
                : 'This is where direct messages with creators you subscribe to will live',
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
