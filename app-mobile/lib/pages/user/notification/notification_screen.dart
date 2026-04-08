import 'package:flutter/material.dart';
import 'package:patreon-clone/backend/post/post_repository.dart';
import 'package:patreon-clone/constants/constants.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon-clone/models/notification/notification_model.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';

import 'package:patreon-clone/backend/messaging/direct_message_controller.dart';
import 'package:patreon-clone/backend/messaging/direct_message_provider.dart';
import 'package:patreon-clone/backend/notification/notification_controller.dart';
import 'package:patreon-clone/backend/notification/notification_provider.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> with MySafeState {
  late MyNotificationProvider notificationProvider;
  late MyNotificationController notificationController;
  ScrollController scrollController = ScrollController();

  Future<void> getData({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    await notificationController.getNotificationsPaginatedList(
      userMode: 'member',
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
    );
  }

  @override
  void initState() {
    super.initState();

    notificationProvider = context.read<MyNotificationProvider>();
    notificationController = MyNotificationController(provider: notificationProvider);
    getData(
      isRefresh: true,
      isFromCache: false,
      isNotify: true,
    );
  }

  @override
  void dispose() {
    scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return SafeArea(
      child: Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        appBar: AppBar(
          elevation: 0,
          scrolledUnderElevation: 0,
          backgroundColor: Colors.transparent,
          title: Text(
            'Notifications',
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1A1A1A),
              letterSpacing: -0.5,
            ).withTiempos,
          ),
          centerTitle: false,
        ),
        body: Consumer<MyNotificationProvider>(
          builder: (context, provider, child) {
            return _buildNotificationList();
          },
        ),
      ),
    );
  }

  Widget _buildNotificationList() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<APIDocumentsPaginatedListModel<NotificationModel>>.value(
          value: notificationProvider.notificationsPaginationModel.get(),
        )
      ],
      child: Consumer<APIDocumentsPaginatedListModel<NotificationModel>>(
        builder: (BuildContext context, APIDocumentsPaginatedListModel<NotificationModel> paginatedListModel, Widget? child) {
          return _buildNotificationListing(context: context, paginatedListModel: paginatedListModel);
        },
      ),
    );
  }

  Widget _buildNotificationListing(
      {required BuildContext context, required APIDocumentsPaginatedListModel<NotificationModel> paginatedListModel}) {
    if (paginatedListModel.isContentsFirstTimeLoading.get()) {
      return const Center(child: LoadingWidget());
    }

    List<NotificationModel> notificationList = paginatedListModel.contentsList.getList(isNewInstance: false);

    if (!paginatedListModel.isContentsLoading.get() && notificationList.isEmpty) {
      return LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          return RefreshIndicator(
            color: themeData.primaryColor,
            onRefresh: () async {
              await getData(
                isRefresh: true,
                isFromCache: false,
                isNotify: true,
              );
            },
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                SizedBox(height: constraints.maxHeight / 3),
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: themeData.primaryColor.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.notifications_none_rounded,
                          size: 40,
                          color: themeData.primaryColor.withValues(alpha: 0.7),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "No notifications yet",
                        style: themeData.textTheme.headlineSmall?.copyWith(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          color: themeData.colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "You're all caught up! Check back later for updates.",
                        textAlign: TextAlign.center,
                        style: themeData.textTheme.bodyMedium?.copyWith(
                          fontSize: 14,
                          color: themeData.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      );
    }

    return RefreshIndicator(
      color: themeData.primaryColor,
      strokeWidth: 2.5,
      onRefresh: () async {
        await getData(
          isRefresh: true,
          isFromCache: false,
          isNotify: true,
        );
      },
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        itemCount: notificationList.length + 1,
        controller: scrollController,
        itemBuilder: (context, index) {
          if ((index == 0 && notificationList.isEmpty) || (index == notificationList.length)) {
            return paginatedListModel.isContentsLoading.get()
                ? const Padding(
                    padding: EdgeInsets.all(12),
                    child: Center(child: LoadingWidget()),
                  )
                : const SizedBox(height: 80);
          }

          if (paginatedListModel.hasMoreContents.get() &&
              index > (notificationList.length - paginatedListModel.contentsDocumentRefreshLimitForPagination.get())) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              getData(
                isRefresh: false,
                isFromCache: false,
                isNotify: false,
              );
            });
          }

          NotificationModel model = notificationList[index];
          return GestureDetector(
            onTap: () => _handleNotificationTap(model),
            child: NotificationCard(
              model: model,
            ),
          );
        },
      ),
    );
  }

  void _handleNotificationTap(NotificationModel model) {
    switch (model.type) {
      case NotificationTypes.liked:
      case NotificationTypes.commented:
      case NotificationTypes.commentReply:
      case NotificationTypes.newPost:
        _handlePostRelatedNotification(model);
        break;

      case NotificationTypes.directMessage:
      case NotificationTypes.directChatCreated:
        _openChatFromNotification(model, isGroupChat: false);
        break;

      case NotificationTypes.chatMessage:
      case NotificationTypes.groupChatCreated:
        _openChatFromNotification(model, isGroupChat: true);
        break;

      case NotificationTypes.newMember:
      case NotificationTypes.downgrade:
      case NotificationTypes.cancellation:
        _handleMembershipNotification();
        break;

      default:
        debugPrint('Notification tapped: ${model.type}');
        break;
    }
  }

  void _handlePostRelatedNotification(NotificationModel model) async {
    final postId = model.post?.id ?? '';
    if (postId.isEmpty) {
      debugPrint('No post ID found for notification: ${model.id}');
      return;
    }

    final fullPost = await PostRepository().getPostById(postId: postId);
    final fallback = PostModel(
      id: postId,
      title: model.post?.title ?? '',
      thumbnailUrl: model.post?.thumbnailUrl ?? '',
    );

    if (!mounted) return;
    context.pushNamed(
      Routes.postDetails,
      extra: {
        'postModel': fullPost ?? fallback,
        'postId': (fullPost ?? fallback).id,
      },
    );
  }

  void _handleMembershipNotification() {
    context.pushNamed(Routes.audience);
  }

  Future<void> _openChatFromNotification(NotificationModel model, {required bool isGroupChat}) async {
    String chatId = '';
    if (model.metadata.isNotEmpty) {
      chatId = model.metadata['chatId']?.toString() ?? '';
    }
    if (chatId.isEmpty && model.link.isNotEmpty) {
      final segments = model.link.split('/');
      if (segments.isNotEmpty) chatId = segments.last;
    }

    final provider = context.read<DirectMessageProvider>();
    final controller = DirectMessageController(provider: provider);

    ChatItem? chat;

    if (chatId.isNotEmpty) {
      List<ChatItem> list =
          isGroupChat ? provider.groupChats.getList(isNewInstance: false) : provider.chats.getList(isNewInstance: false);
      try {
        chat = list.firstWhere((c) => c.chat.id == chatId);
      } catch (_) {
        chat = null;
      }

      if (chat == null) {
        if (isGroupChat) {
          await controller.getGroupChats(isRefresh: true, isFromCache: false, isNotify: false);
          list = provider.groupChats.getList(isNewInstance: false);
        } else {
          await controller.getChats(isRefresh: true, isFromCache: false, isNotify: false);
          list = provider.chats.getList(isNewInstance: false);
        }
        try {
          chat = list.firstWhere((c) => c.chat.id == chatId);
        } catch (_) {
          chat = null;
        }
      }
    }

    if (chat != null) {
      context.pushNamed(Routes.chat, extra: {'chat': chat});
    } else {
      _navigateToMessagingTab(isGroupChat: isGroupChat);
    }
  }

  void _navigateToMessagingTab({required bool isGroupChat}) {
    context.pushNamed(
      Routes.messaging,
      extra: {'initialTabIndex': isGroupChat ? 0 : 1},
    );
  }
}

class NotificationCard extends StatefulWidget {
  final NotificationModel model;
  const NotificationCard({super.key, required this.model});

  @override
  State<NotificationCard> createState() => _NotificationCardState();
}

class _NotificationCardState extends State<NotificationCard> with MySafeState {
  String? _extractGroupName(String s) {
    if (s.isEmpty) return null;
    // Works for: "You have been added to the group chat: all subs"
    final idx = s.indexOf(':');
    if (idx == -1) return null;
    final name = s.substring(idx + 1).trim();
    return name.isEmpty ? null : name;
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    // final isDarkMode = themeData.brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: !widget.model.isRead
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  themeData.primaryColor.withValues(alpha: 0.02),
                  Colors.transparent,
                ],
              )
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _handleNotificationTap(widget.model),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                _buildAvatar(),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildMessageText(),
                      const SizedBox(height: 6),
                      _buildTimeAndStatus(),
                    ],
                  ),
                ),
                _buildActionIcon(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar() {
    final hasProfilePicture = (widget.model.actor.profilePicture).isNotEmpty;

    return Stack(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: hasProfilePicture ? Colors.transparent : _getTypeColor().withValues(alpha: 0.15),
            border: Border.all(
              color: _getTypeColor().withValues(alpha: 0.2),
              width: 1.5,
            ),
          ),
          child: hasProfilePicture
              ? ClipOval(
                  child: CommonCachedNetworkImage(
                    imageUrl: widget.model.actor.profilePicture,
                    fit: BoxFit.cover,
                    height: 45,
                    width: 45,
                  ),
                )
              : Icon(
                  _getIconForType(),
                  color: _getTypeColor(),
                  size: 22,
                ),
        ),
      ],
    );
  }

  Widget _buildMessageText() {
    final parts = _getMessageParts();

    return RichText(
      text: TextSpan(
        children: [
          TextSpan(
            text: parts['actorName'],
            style: themeData.textTheme.bodyMedium
                ?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: themeData.colorScheme.onSurface,
                  height: 1.3,
                )
                .withEpilogue,
          ),
          TextSpan(
            text: parts['action'],
            style: themeData.textTheme.bodyMedium
                ?.copyWith(
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                  color: themeData.colorScheme.onSurface.withValues(alpha: 0.8),
                  height: 1.3,
                )
                .withEpilogue,
          ),
          if (parts['postTitle'] != null && parts['postTitle']!.isNotEmpty)
            TextSpan(
              text: parts['postTitle'],
              style: themeData.textTheme.bodyMedium
                  ?.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: themeData.primaryColor,
                    height: 1.3,
                  )
                  .withEpilogue,
            ),
        ],
      ),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildTimeAndStatus() {
    return Row(
      children: [
        const Icon(Icons.access_time_rounded, size: 12, color: Colors.grey),
        const SizedBox(width: 4),
        Text(
          _getFormattedTime(),
          style: themeData.textTheme.bodySmall
              ?.copyWith(
                fontSize: 10,
                color: Colors.grey.shade500,
                fontWeight: FontWeight.w500,
              )
              .withEpilogue,
        ),
      ],
    );
  }

  Widget _buildActionIcon() {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: _getTypeColor().withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(
        _getIconForType(),
        color: _getTypeColor(),
        size: 16,
      ),
    );
  }

  Map<String, String?> _getMessageParts() {
    final actorName = (widget.model.actor.name).isNotEmpty ? widget.model.actor.name : 'Someone';

    final postTitle = widget.model.post?.title ?? '';
    final commentContent = widget.model.comment?.content ?? '';
    final hasComment = commentContent.isNotEmpty;

    switch (widget.model.type) {
      // From your data ------------------------------
      case NotificationTypes.liked:
        return {
          'actorName': actorName,
          'action': postTitle.isNotEmpty ? ' liked your post ' : ' liked your post',
          'postTitle': postTitle.isNotEmpty ? '"$postTitle"' : null,
        };

      case NotificationTypes.commented:
        return {
          'actorName': actorName,
          'action': hasComment
              ? ' commented on: "$commentContent"'
              : (postTitle.isNotEmpty ? ' commented on ' : ' commented on your post'),
          'postTitle': postTitle.isNotEmpty ? '"$postTitle"' : null,
        };

      case NotificationTypes.newMember:
        // Example content: "Subscribed to Free Tier tier"
        final tierInfo = widget.model.comment?.content ?? '';
        final tier =
            tierInfo.contains('tier') ? tierInfo.split('tier')[0].replaceAll('Subscribed to', '').trim() : 'the community';
        return {
          'actorName': actorName,
          'action': ' joined $tier',
          'postTitle': null,
        };

      case NotificationTypes.directMessage:
        // DM between two users
        return {
          'actorName': actorName,
          'action': hasComment ? ' sent: "$commentContent"' : ' sent you a message',
          'postTitle': null,
        };

      case NotificationTypes.directChatCreated:
        return {
          'actorName': actorName,
          'action': ' started a conversation with you.',
          'postTitle': null,
        };

      case NotificationTypes.chatMessage: // chat_message (group/community)
        return {
          'actorName': actorName,
          'action': hasComment ? ' posted in chat: "$commentContent"' : ' posted in chat',
          'postTitle': null,
        };

      case NotificationTypes.groupChatCreated:
        final group = _extractGroupName(commentContent); // e.g., "all subs"
        return {
          'actorName': actorName,
          'action': group != null ? ' added you to the group ' : ' added you to a group chat',
          'postTitle': group != null ? '"$group"' : null,
        };

      // Existing app-specific fallbacks -------------
      case NotificationTypes.commentReply:
        return {
          'actorName': actorName,
          'action': hasComment ? ' replied: "$commentContent"' : ' replied to your comment',
          'postTitle': null,
        };

      case NotificationTypes.downgrade:
        return {
          'actorName': actorName,
          'action': ' downgraded their membership',
          'postTitle': null,
        };

      case NotificationTypes.cancellation:
        return {
          'actorName': actorName,
          'action': ' cancelled their membership',
          'postTitle': null,
        };

      case NotificationTypes.newPost:
        return {
          'actorName': actorName,
          'action': postTitle.isNotEmpty ? ' published ' : ' published a new post',
          'postTitle': postTitle.isNotEmpty ? '"$postTitle"' : null,
        };

      default:
        return {
          'actorName': actorName,
          'action': ' performed an action',
          'postTitle': null,
        };
    }
  }

  IconData _getIconForType() {
    switch (widget.model.type) {
      case NotificationTypes.liked:
        return Icons.favorite_rounded;
      case NotificationTypes.commented:
      case NotificationTypes.commentReply:
        return Icons.chat_bubble_rounded;
      case NotificationTypes.directMessage:
        return Icons.message_rounded;
      case NotificationTypes.directChatCreated:
        return Icons.mark_chat_unread_rounded;
      case NotificationTypes.chatMessage:
        return Icons.forum_rounded;
      case NotificationTypes.groupChatCreated:
        return Icons.group_add_rounded;
      case NotificationTypes.newMember:
        return Icons.person_add_alt_1_rounded;
      case NotificationTypes.downgrade:
        return Icons.arrow_downward_rounded;
      case NotificationTypes.cancellation:
        return Icons.cancel_rounded;
      case NotificationTypes.newPost:
        return Icons.article_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _getTypeColor() {
    switch (widget.model.type) {
      case NotificationTypes.liked:
        return Colors.red;
      case NotificationTypes.commented:
      case NotificationTypes.commentReply:
        return themeData.primaryColor;
      case NotificationTypes.directMessage:
        return Colors.green;
      case NotificationTypes.directChatCreated:
        return Colors.teal;
      case NotificationTypes.chatMessage:
        return Colors.blueGrey;
      case NotificationTypes.groupChatCreated:
        return Colors.blue;
      case NotificationTypes.newMember:
        return Colors.purple;
      case NotificationTypes.downgrade:
        return Colors.orange;
      case NotificationTypes.cancellation:
        return Colors.red.shade700;
      case NotificationTypes.newPost:
        return Colors.indigo;
      default:
        return Colors.grey;
    }
  }

  String _getFormattedTime() {
    final now = DateTime.now();
    final notificationTime = widget.model.createdAt;
    final difference = now.difference(notificationTime);

    if (difference.inSeconds < 60) return 'Just now';
    if (difference.inMinutes < 60) return '${difference.inMinutes}m ago';
    if (difference.inHours < 24) return '${difference.inHours}h ago';
    if (difference.inDays < 7) return '${difference.inDays}d ago';
    if (difference.inDays < 30) {
      return '${(difference.inDays / 7).floor()}w ago';
    }
    if (difference.inDays < 365) {
      return '${(difference.inDays / 30).floor()}mo ago';
    }
    return '${(difference.inDays / 365).floor()}y ago';
  }

  void _handleNotificationTap(NotificationModel model) {
    switch (widget.model.type) {
      case NotificationTypes.liked:
      case NotificationTypes.commented:
      case NotificationTypes.commentReply:
      case NotificationTypes.newPost:
        _handlePostRelatedNotification(model);
        break;

      case NotificationTypes.directMessage:
      case NotificationTypes.directChatCreated:
        _openChatFromNotification(model, isGroupChat: false);
        break;

      case NotificationTypes.chatMessage:
      case NotificationTypes.groupChatCreated:
        _openChatFromNotification(model, isGroupChat: true);
        break;

      case NotificationTypes.newMember:
      case NotificationTypes.downgrade:
      case NotificationTypes.cancellation:
        _handleMembershipNotification();
        break;

      default:
        debugPrint('Notification tapped: ${widget.model.type}');
        break;
    }
  }

  void _handlePostRelatedNotification(NotificationModel model) async {
    final postId = model.post?.id ?? '';
    if (postId.isEmpty) {
      debugPrint('No post ID found for notification: ${model.id}');
      return;
    }

    final fullPost = await PostRepository().getPostById(postId: postId);
    final fallback = PostModel(
      id: postId,
      title: model.post?.title ?? '',
      thumbnailUrl: model.post?.thumbnailUrl ?? '',
    );

    if (!mounted) return;
    context.pushNamed(
      Routes.postDetails,
      extra: {
        'postModel': fullPost ?? fallback,
        'postId': (fullPost ?? fallback).id,
      },
    );
  }

  void _handleMembershipNotification() {
    context.pushNamed(Routes.audience);
  }

  Future<void> _openChatFromNotification(NotificationModel model, {required bool isGroupChat}) async {
    String chatId = '';
    if (model.metadata.isNotEmpty) {
      chatId = model.metadata['chatId']?.toString() ?? '';
    }
    if (chatId.isEmpty && model.link.isNotEmpty) {
      final segments = model.link.split('/');
      if (segments.isNotEmpty) chatId = segments.last;
    }

    final provider = context.read<DirectMessageProvider>();
    final controller = DirectMessageController(provider: provider);

    ChatItem? chat;

    if (chatId.isNotEmpty) {
      List<ChatItem> list =
          isGroupChat ? provider.groupChats.getList(isNewInstance: false) : provider.chats.getList(isNewInstance: false);
      try {
        chat = list.firstWhere((c) => c.chat.id == chatId);
      } catch (_) {
        chat = null;
      }

      if (chat == null) {
        if (isGroupChat) {
          await controller.getGroupChats(isRefresh: true, isFromCache: false, isNotify: false);
          list = provider.groupChats.getList(isNewInstance: false);
        } else {
          await controller.getChats(isRefresh: true, isFromCache: false, isNotify: false);
          list = provider.chats.getList(isNewInstance: false);
        }
        try {
          chat = list.firstWhere((c) => c.chat.id == chatId);
        } catch (_) {
          chat = null;
        }
      }
    }

    if (chat != null) {
      context.pushNamed(Routes.chat, extra: {'chat': chat});
    } else {
      _navigateToMessagingTab(isGroupChat: isGroupChat);
    }
  }

  void _navigateToMessagingTab({required bool isGroupChat}) {
    context.pushNamed(
      Routes.messaging,
      extra: {'initialTabIndex': isGroupChat ? 0 : 1},
    );
  }
}
