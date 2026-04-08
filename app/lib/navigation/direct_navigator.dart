import 'package:flutter/material.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/backend/post/post_repository.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/backend/creator/my_creator_controller.dart';

import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';

import 'package:patreon-clone/pages/user/home/components/custom_bottom_bar.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';

import 'package:patreon-clone/pages/tab_state.dart';
import 'package:patreon-clone/backend/messaging/direct_message_controller.dart';
import 'package:patreon-clone/backend/messaging/direct_message_provider.dart';

class DirectNavigator {
  static void navigateToTab(int tabIndex, {int messagingTabIndex = 0}) {
    BuildContext? context = AppRouter.rootNavigatorKey.currentContext;

    if (context != null) {
      context.read<TabState>().setTab(tabIndex, messagingTabIndex: messagingTabIndex);
    } else {
      MyPrint.printOnConsole("DirectNavigator: Could not get context for navigation.");
    }
  }

  static Future<void> navigateToPostDetails(String postId) async {
    BuildContext? context = AppRouter.rootNavigatorKey.currentContext;

    if (context != null) {
      try {
        PostModel? postModel = await PostRepository().getPostById(postId: postId);

        if (postModel != null) {
          context.pushNamed(
            Routes.postDetails,
            extra: {
              'postModel': postModel,
              'postId': postId,
            },
          );
        } else {
          MyPrint.printOnConsole("DirectNavigator: Could not fetch post details for postId: $postId");
        }
      } catch (e) {
        MyPrint.printOnConsole("DirectNavigator: Error fetching post details: $e");
      }
    } else {
      MyPrint.printOnConsole("DirectNavigator: Could not get context for navigation.");
    }
  }

  static Future<void> navigateToCreatorPage(String username) async {
    BuildContext? context = AppRouter.rootNavigatorKey.currentContext;

    if (context != null) {
      try {
        final creator = await MyCreatorController.fetchCreator(userName: username);
        context.pushNamed(
          Routes.creatorProfile,
          extra: {
            'creatorModel': creator,
            'creatorUsername': username,
          },
        );
        if (creator != null) {
        } else {
          MyPrint.printOnConsole("DirectNavigator: Could not fetch creator data  : $username");
        }
      } catch (e) {
        MyPrint.printOnConsole("DirectNavigator: Error fetching post details: $e");
      }
    } else {
      MyPrint.printOnConsole("DirectNavigator: Could not get context for navigation.");
    }
  }

  static Future<void> navigateToChat(String chatId, {required bool isGroupChat}) async {
    BuildContext? context = AppRouter.rootNavigatorKey.currentContext;

    if (context == null) {
      MyPrint.printOnConsole("NotificationService: Could not get context for navigation.");
      return;
    }

    try {
      MyPrint.printOnConsole("NotificationService: Attempting to navigate to chat: $chatId, isGroupChat: $isGroupChat");

      final provider = context.read<DirectMessageProvider>();
      final controller = DirectMessageController(provider: provider);

      ChatItem? chat = await _findChatById(chatId, isGroupChat, provider, controller);

      if (chat != null) {
        MyPrint.printOnConsole("NotificationService: Found chat, navigating...");
        context.read<TabState>().setTab(HomePageTabs.community, messagingTabIndex: isGroupChat ? 0 : 1);
        context.pushNamed(
          Routes.chat,
          extra: {'chat': chat},
        );
        MyPrint.printOnConsole("NotificationService: Successfully navigated to chat");
      } else {
        MyPrint.printOnConsole("NotificationService: Could not find chat with id: $chatId");
      }
    } catch (e) {
      MyPrint.printOnConsole("NotificationService: Error navigating to chat: $e");
    }
  }

  static Future<void> navigateToMessagingTab({required bool isGroupChat}) async {
    BuildContext? context = AppRouter.rootNavigatorKey.currentContext;

    if (context == null) {
      MyPrint.printOnConsole("NotificationService: Could not get context for navigation.");
      return;
    }
    context.read<TabState>().setTab(HomePageTabs.community, messagingTabIndex: isGroupChat ? 0 : 1);
  }

  static Future<void> navigateToMainScreen(BuildContext context, {bool forceRefresh = false}) async {
    await SharedPrefManager().setBool(SharedPreferenceConstants.isCreatorMode, false);
    if (context.mounted) {
      context.goNamed(Routes.main, extra: {'forceRefresh': forceRefresh});
    }
  }

  static Future<void> navigateToMyCreatorPage(BuildContext context) async {
    await SharedPrefManager().setBool(SharedPreferenceConstants.isCreatorMode, true);
    if (context.mounted) {
      context.pushNamed(Routes.myCreatorPage);
    }
  }

  static Future<void> navigateToCreatorMainScreen(BuildContext context) async {
    await SharedPrefManager().setBool(SharedPreferenceConstants.isCreatorMode, true);
    if (context.mounted) {
      context.goNamed(Routes.creatorMain);
    }
  }

  /// Helper method to find chat by ID with proper error handling
  static Future<ChatItem?> _findChatById(
    String id,
    bool isGroupChat,
    DirectMessageProvider provider,
    DirectMessageController controller,
  ) async {
    try {
      // 1) Try current in-memory lists with expanded matching
      List<ChatItem> primary = isGroupChat ? provider.groupChats.getList() : provider.chats.getList();

      MyPrint.printOnConsole(
        "NotificationService: Searching ${primary.length} ${isGroupChat ? 'group' : 'direct'} chats for id=$id",
      );

      ChatItem? chat = _findChatInList(primary, id, isGroupChat: isGroupChat);
      if (chat != null) {
        MyPrint.printOnConsole("NotificationService: Found chat in existing list");
        return chat;
      }

      // 2) Refresh primary list, try again
      MyPrint.printOnConsole("NotificationService: Not found, refreshing ${isGroupChat ? 'group' : 'direct'} chats...");
      if (isGroupChat) {
        await controller.getGroupChats(isRefresh: true, isFromCache: false, isNotify: false);
        primary = provider.groupChats.getList();
      } else {
        await controller.getChats(isRefresh: true, isFromCache: false, isNotify: false);
        primary = provider.chats.getList();
      }

      chat = _findChatInList(primary, id, isGroupChat: isGroupChat);
      if (chat != null) {
        MyPrint.printOnConsole("NotificationService: Found chat after refresh");
        return chat;
      }

      // 3) Fallback: check the other list (sometimes server label differs)
      List<ChatItem> fallback = isGroupChat ? provider.chats.getList() : provider.groupChats.getList();

      MyPrint.printOnConsole(
        "NotificationService: Still not found, searching ${isGroupChat ? 'direct' : 'group'} list (${fallback.length})",
      );

      chat = _findChatInList(fallback, id, isGroupChat: !isGroupChat);
      if (chat != null) {
        MyPrint.printOnConsole(
          "NotificationService: Found chat in ${isGroupChat ? 'direct' : 'group'} list fallback",
        );
      }

      return chat;
    } catch (e) {
      MyPrint.printOnConsole("NotificationService: Error in _findChatById: $e");
      return null;
    }
  }

  /// Helper method to safely find chat in a list with flexible keys
  static ChatItem? _findChatInList(
    List<ChatItem> chatList,
    String id, {
    required bool isGroupChat,
  }) {
    try {
      for (final chatItem in chatList) {
        // 1) Exact chat id
        if ((chatItem.chat.id == id)) {
          MyPrint.printOnConsole("NotificationService: Match by chat.id");
          return chatItem;
        }

        if (isGroupChat) {
          // 2) Group chat: creator-based keys (to support actorId)
          if ((chatItem.creator.userId == id) || (chatItem.chat.creator == id)) {
            MyPrint.printOnConsole("NotificationService: Match by group creator id (actorId)");
            return chatItem;
          }
        } else {
          // 3) Direct chat: other participant keys
          if (chatItem.otherUser.userId == id) {
            MyPrint.printOnConsole("NotificationService: Match by otherUser.userId");
            return chatItem;
          }
          // consider any participant id
          try {
            if (chatItem.allParticipants.any((p) => p.userId == id)) {
              MyPrint.printOnConsole("NotificationService: Match by participant userId");
              return chatItem;
            }
          } catch (_) {
            // ignore
          }
        }
      }
      return null;
    } catch (e) {
      MyPrint.printOnConsole("NotificationService: Error searching in chat list: $e");
      return null;
    }
  }
}
