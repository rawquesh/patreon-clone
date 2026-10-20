import 'dart:async';
// import 'dart:convert';  // No longer needed - ApiService handles JSON
import 'dart:io';
import 'package:patreon_clone/models/message/attachment_data_model.dart';
import 'package:mime/mime.dart';
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as p;

import 'package:patreon_clone/backend/common/api_endpoints.dart';
import 'package:patreon_clone/backend/common/api_response.dart';
import 'package:patreon_clone/backend/common/api_service.dart';
import 'package:patreon_clone/constants/shared_preference_constants.dart';

import 'package:patreon_clone/models/audience/subscriber.dart';
import 'package:patreon_clone/models/chat/chat_model.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/message/message_data_model.dart';
import 'package:patreon_clone/models/user/data_model/user_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';
import 'package:patreon_clone/managers/shared_pref_manager.dart';

import 'package:patreon_clone/backend/common/dependency_injection.dart';
import 'chat_repository.dart';
import 'chat_socket_service.dart';
import 'direct_message_provider.dart';

class DirectMessageController {
  late DirectMessageProvider _provider;
  late ChatSocketService _socketService;
  late ChatRepository _chatRepository; // Add repository instance

  DirectMessageController({required DirectMessageProvider? provider}) {
    _provider = provider ?? DirectMessageProvider();
    _socketService = DependencyInjection.chatSocketService;
    _chatRepository = ChatRepository(); // Initialize the repository
  }

  DirectMessageProvider get provider => _provider;

  Future<Function(dynamic)> connectAndJoinChat(
    String chatId,
    Function(MessageModel) onMessage,
  ) async {
    String? token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);

    MyPrint.printOnConsole('Starting socket connection for chat: $chatId');

    // Step 1: Ensure socket connection
    await _socketService.connect(token: token ?? '');

    // Step 2: Wait for connection to be fully established
    int retryCount = 0;
    const maxRetries = 10; // 5 seconds max wait
    while (!_socketService.isConnected && retryCount < maxRetries) {
      MyPrint.printOnConsole('Waiting for socket connection... Attempt: ${retryCount + 1}');
      await Future.delayed(const Duration(milliseconds: 500));
      retryCount++;
    }

    if (!_socketService.isConnected) {
      MyPrint.printOnConsole('Socket connection failed after $maxRetries attempts');
      throw Exception('Socket connection failed');
    }

    MyPrint.printOnConsole('Socket connected successfully');

    void handler(dynamic data) {
      MyPrint.printOnConsole('Received new message data: $data');
      MyPrint.printOnConsole('Data type: ${data.runtimeType}');

      try {
        if (data is Map) {
          MyPrint.printOnConsole('Data keys: ${data.keys.toList()}');

          if (data.containsKey('message')) {
            Map<String, dynamic> messageMap = ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(data['message']);

            if (!messageMap.containsKey('chat') && data['chatId'] != null) {
              messageMap['chat'] = data['chatId'];
            }

            if (messageMap['sender'] != null && messageMap['sender'] is Map) {
              messageMap['sender'] = messageMap['sender']['id'];
            }
            if (messageMap['attachments'] != null && messageMap['attachments'] is List) {
              List<dynamic> attachmentsList = messageMap['attachments'];
              Map<String, dynamic> attachmentsMap = {};
              for (int i = 0; i < attachmentsList.length; i++) {
                attachmentsMap[i.toString()] = attachmentsList[i];
              }
              messageMap['attachments'] = attachmentsMap;
            }

            MyPrint.printOnConsole('Parsed message map: $messageMap');

            MessageModel message = MessageModel.fromMap(messageMap);
            MyPrint.printOnConsole('Created MessageModel - chatId: ${message.chat}, expected: $chatId');

            if (message.chat == chatId) {
              MyPrint.printOnConsole('Message belongs to current chat, calling onMessage callback');
              onMessage(message);
            } else {
              MyPrint.printOnConsole('Message belongs to different chat: ${message.chat}');
            }
          } else {
            MyPrint.printOnConsole('Data received without message key. Available keys: ${data.keys.toList()}');
          }
        } else {
          MyPrint.printOnConsole('Data is not a Map, received: $data');
        }
      } catch (e, stackTrace) {
        MyPrint.printOnConsole('Error parsing new message: $e');
        MyPrint.printOnConsole('Stack trace: $stackTrace');
        MyPrint.printOnConsole('Raw data that caused error: $data');
      }
    }

    MyPrint.printOnConsole('Setting up message handler');
    _socketService.onNewMessage(handler);

    MyPrint.printOnConsole('Joining chat room: $chatId');
    _socketService.joinChat(chatId);

    await Future.delayed(const Duration(milliseconds: 200));

    MyPrint.printOnConsole('Successfully set up chat connection for: $chatId');
    return handler;
  }

  void leaveChat(String chatId, Function(dynamic) handler) {
    MyPrint.printOnConsole('Leaving chat and removing handler');
    _socketService.leaveChat(chatId);
    _socketService.offNewMessage();
  }

  Future<void> sendMessage(
    String chatId,
    String content, {
    File? attachmentFile,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole('DirectMessageController.sendMessage called', tag: tag);

    String? currentUserId = await SharedPrefManager().getString(SharedPreferenceConstants.userId);
    final sentAt = DateTime.now();

    final tempId = 'temp-${sentAt.microsecondsSinceEpoch}';
    MessageModel tempMessage = MessageModel(
      id: tempId,
      chat: chatId,
      sender: currentUserId ?? '',
      content: content,
      createdAt: sentAt,
      updatedAt: sentAt,
    );

    if (attachmentFile != null) {
      final mime = lookupMimeType(attachmentFile.path) ?? 'image/*';
      final size = await attachmentFile.length();
      tempMessage.attachments['0'] = AttachmentModel.fromMap({
        'url': attachmentFile.path,
        'fileName': p.basename(attachmentFile.path),
        'fileType': mime,
        'fileSize': size,
      });
    }

    final map = _provider.messagesPaginationMap.getMap(isNewInstance: false);
    APIDocumentsPaginatedListModel<MessageModel> paginated = map[chatId] ??
        APIDocumentsPaginatedListModel<MessageModel>(
          contentsDocumentLimit: 5,
          contentsDocumentRefreshLimit: 10,
        );
    paginated.contentsList.insertAtIndex(index: 0, model: tempMessage, isNotify: false);
    map[chatId] = paginated;

    if (_provider.selectedChat.get()?.chat.id == chatId) {
      _provider.messagesPaginationModel.set(value: paginated, isNotify: false);
      _provider.messages.insertAtIndex(index: 0, model: tempMessage, isNotify: true);
    }

    try {
      final ApiService apiService = ApiService();
      final ApiResponse<Map<String, dynamic>> response;

      if (attachmentFile != null) {
        final mime = lookupMimeType(attachmentFile.path) ?? 'image/*';
        response = await apiService.multipartRequest(
          method: 'POST',
          endpoint: ApiEndpoints.chatMessages(chatId),
          fields: {'content': content},
          files: [
            MultipartFileData.fromFile(
              field: 'attachment',
              file: attachmentFile,
              contentType: MediaType.parse(mime),
            ),
          ],
        );
      } else {
        response = await apiService.post(
          ApiEndpoints.chatMessages(chatId),
          body: {'content': content},
        );
      }

      if (response.success && response.data != null) {
        Map<String, dynamic> data = response.data!;

        if (data['sender'] is Map) data['sender'] = data['sender']['id'];
        if (data['attachments'] is List) {
          final List attachmentsList = data['attachments'];
          final Map<String, dynamic> attachmentsMap = {};
          for (int i = 0; i < attachmentsList.length; i++) {
            attachmentsMap[i.toString()] = attachmentsList[i];
          }
          data['attachments'] = attachmentsMap;
        }

        MessageModel serverMessage = MessageModel.fromMap(data);

        final list = paginated.contentsList.getList(isNewInstance: false);
        final i = list.indexWhere((m) => m.id == tempId);
        if (i != -1) list[i] = serverMessage;

        if (_provider.selectedChat.get()?.chat.id == chatId) {
          _provider.messages.setList(list: paginated.contentsList.getList(), isClear: true, isNotify: true);
          _provider.messagesPaginationModel.set(value: paginated, isNotify: false);
        }

        await getChats(isRefresh: true, isFromCache: false, isNotify: true);
      } else {
        MyPrint.printOnConsole('Failed to send message: ${response.statusCode}', tag: tag);
        final list = paginated.contentsList.getList(isNewInstance: false);
        list.removeWhere((m) => m.id == tempId);
        if (_provider.selectedChat.get()?.chat.id == chatId) {
          _provider.messages.setList(list: list, isClear: true, isNotify: true);
        }
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error sending message: $e', tag: tag);
      MyPrint.printOnConsole(s, tag: tag);
      // Rollback optimistic bubble on error
      final list = paginated.contentsList.getList(isNewInstance: false);
      list.removeWhere((m) => m.id == tempId);
      if (_provider.selectedChat.get()?.chat.id == chatId) {
        _provider.messages.setList(list: list, isClear: true, isNotify: true);
      }
    }
  }

  Future<void> getChats({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole('DirectMessageController.getChats called with isRefresh:$isRefresh, isFromCache:$isFromCache',
        tag: tag);

    if (!isRefresh && isFromCache && _provider.chats.length > 0) {
      MyPrint.printOnConsole('Returning cached chats', tag: tag);
      return;
    }

    try {
      final response = await ApiService().getOrThrow(ApiEndpoints.chat);

      final List<dynamic> chatList = response['directChats'] ?? [];
      String? currentUserId = await SharedPrefManager().getString(SharedPreferenceConstants.userId);

      List<ChatItem> chats = chatList
          .map((e) => _parseChatItem(ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(e), currentUserId ?? ''))
          .toList();

      _provider.chats.setList(list: chats, isClear: true, isNotify: isNotify);
    } catch (e, s) {
      MyPrint.printOnConsole('Error loading chats: $e', tag: tag);
      MyPrint.printOnConsole(s, tag: tag);
    }
  }

  Future<void> getGroupChats({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole('DirectMessageController.getGroupChats called with isRefresh:$isRefresh, isFromCache:$isFromCache',
        tag: tag);

    if (!isRefresh && isFromCache && _provider.groupChats.length > 0) {
      MyPrint.printOnConsole('Returning cached group chats', tag: tag);
      return;
    }

    try {
      final response = await ApiService().getOrThrow(ApiEndpoints.chat);

      final List<dynamic> chatList = response['groupChats'] ?? [];
      String? currentUserId = await SharedPrefManager().getString(SharedPreferenceConstants.userId);

      List<ChatItem> groupChats = chatList
          .map((e) => _parseChatItem(ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(e), currentUserId ?? ''))
          .toList();

      _provider.groupChats.setList(list: groupChats, isClear: true, isNotify: isNotify);
    } catch (e, s) {
      MyPrint.printOnConsole('Error loading chats: $e', tag: tag);
      MyPrint.printOnConsole(s, tag: tag);
    }
  }

  ChatItem _parseChatItem(Map<String, dynamic> map, String currentUserId) {
    List<dynamic> participantsRaw = ParsingHelper.parseListMethod(map['participants']);
    List<UserModel> participants = participantsRaw.map((e) {
      final participantMap = ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(e);
      return UserModel(
        userId: ParsingHelper.parseStringMethod(participantMap['id']),
        displayName: ParsingHelper.parseStringMethod(participantMap['name']),
        profilePicture: ParsingHelper.parseStringMethod(participantMap['profilePicture']),
      );
    }).toList();

    List<String> participantIds = participants.map((e) => e.userId).toList();

    Map<String, dynamic> creatorMap = ParsingHelper.parseMapMethod(map['creator']);
    UserModel creator = UserModel(
      userId: ParsingHelper.parseStringMethod(creatorMap['id']),
      displayName: ParsingHelper.parseStringMethod(creatorMap['name']),
    );

    Map<String, dynamic> chatMap = Map<String, dynamic>.from(map);
    chatMap['participants'] = participantIds;
    if (map['creator'] != null) {
      chatMap['creator'] = ParsingHelper.parseStringMethod(map['creator']['id']);
    }
    if (map['lastMessage'] != null) {
      chatMap['lastMessage'] = ParsingHelper.parseStringMethod(map['lastMessage']['content']);
    }

    ChatModel chatModel = ChatModel.fromMap(chatMap);

    UserModel otherUser;
    if (chatModel.type == 'group') {
      otherUser = UserModel(
        userId: '',
        displayName: chatModel.title,
      );
    } else {
      otherUser = participants.firstWhere((p) => p.userId != currentUserId, orElse: () => participants.first);
    }

    MessageModel? lastMessage;
    if (map['lastMessage'] != null) {
      lastMessage = MessageModel(
        id: '',
        chat: chatModel.id,
        sender: ParsingHelper.parseStringMethod(map['lastMessage']['sender']),
        content: ParsingHelper.parseStringMethod(map['lastMessage']['content']),
        createdAt: ParsingHelper.parseDateTimeMethod(map['lastMessage']['timestamp']) ?? DateTime.now(),
        updatedAt: ParsingHelper.parseDateTimeMethod(map['lastMessage']['timestamp']) ?? DateTime.now(),
      );
    }

    int unreadCount = ParsingHelper.parseIntMethod(map['unreadCount']);

    return ChatItem(
      chat: chatModel,
      otherUser: otherUser,
      creator: creator,
      allParticipants: participants,
      lastMessage: lastMessage,
      unreadCount: unreadCount,
    );
  }

  Future<void> getChatMessagesPaginatedList({
    required String chatId,
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole(
        'DirectMessageController.getChatMessagesPaginatedList called for chatId:$chatId with isRefresh:$isRefresh, isFromCache:$isFromCache',
        tag: tag);

    APIDocumentsPaginatedListModel<MessageModel>? paginatedListModel =
        _provider.messagesPaginationMap.getMap(isNewInstance: false)[chatId];

    paginatedListModel ??= APIDocumentsPaginatedListModel<MessageModel>(
      contentsDocumentLimit: 10,
      contentsDocumentRefreshLimit: 10,
    );

    _provider.messagesPaginationMap.getMap(isNewInstance: false)[chatId] = paginatedListModel;

    if (_provider.selectedChat.get()?.chat.id == chatId) {
      _provider.messagesPaginationModel.set(value: paginatedListModel, isNotify: false);
    }

    if (!isRefresh && isFromCache && paginatedListModel.contentsLength > 0) {
      MyPrint.printOnConsole('Returning cached chat messages', tag: tag);
      if (_provider.selectedChat.get()?.chat.id == chatId) {
        _provider.messages.setList(list: paginatedListModel.contentsList.getList(), isClear: true, isNotify: isNotify);
      }
      return;
    }

    try {
      if (isRefresh) {
        paginatedListModel.reset(isNotify: false);
        paginatedListModel.hasMoreContents.set(value: true, isNotify: false);
        paginatedListModel.isContentsFirstTimeLoading.set(value: true, isNotify: isNotify);
      }

      if (!paginatedListModel.hasMoreContents.get()) {
        MyPrint.printOnConsole('No more messages to load', tag: tag);
        return;
      }

      if (paginatedListModel.isContentsLoading.get()) {
        MyPrint.printOnConsole('Messages already loading', tag: tag);
        return;
      }

      paginatedListModel.isContentsLoading.set(value: true, isNotify: isNotify);

      final int page = paginatedListModel.currentPage.get();
      final int limit = paginatedListModel.contentsDocumentLimitForPagination.get();

      final response = await ApiService().getOrThrow(
        ApiEndpoints.chatMessages(chatId),
        queryParams: {
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      final List<dynamic> rawList = response['messages'] ?? [];
      List<MessageModel> messages = rawList.map((e) {
        Map<String, dynamic> messageMap = ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(e);

        // Transform sender object to just the ID string
        if (messageMap['sender'] != null && messageMap['sender'] is Map) {
          messageMap['sender'] = messageMap['sender']['id'];
        }

        // Transform attachments from array to map if needed
        if (messageMap['attachments'] != null && messageMap['attachments'] is List) {
          List<dynamic> attachmentsList = messageMap['attachments'];
          Map<String, dynamic> attachmentsMap = {};
          for (int i = 0; i < attachmentsList.length; i++) {
            attachmentsMap[i.toString()] = attachmentsList[i];
          }
          messageMap['attachments'] = attachmentsMap;
        }

        return MessageModel.fromMap(messageMap);
      }).toList();

      bool hasMore = ParsingHelper.parseBoolMethod(response['hasMore']);

      paginatedListModel.hasMoreContents.set(value: hasMore, isNotify: false);

      if (isRefresh) {
        paginatedListModel.contentsList.setList(list: messages, isClear: true, isNotify: false);
      } else {
        final current = paginatedListModel.contentsList.getList();
        paginatedListModel.contentsList.setList(list: [...current, ...messages], isClear: true, isNotify: false);
      }

      paginatedListModel.currentPage.set(value: page + 1, isNotify: false);

      if (_provider.selectedChat.get()?.chat.id == chatId) {
        _provider.messagesPaginationModel.set(value: paginatedListModel, isNotify: false);
        _provider.messages.setList(list: paginatedListModel.contentsList.getList(), isClear: true, isNotify: isNotify);
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error loading chat messages: $e', tag: tag);
      MyPrint.printOnConsole(s, tag: tag);
    } finally {
      paginatedListModel.isContentsFirstTimeLoading.set(value: false, isNotify: false);
      paginatedListModel.isContentsLoading.set(value: false, isNotify: false);
    }
  }

  Future<ChatModel?> createGroupChat({
    required String title,
    String? description,
    required String accessType,
    List<String>? accessTiers,
  }) async {
    ChatModel? newChat = await _chatRepository.createGroupChat(
      title: title,
      description: description,
      accessType: accessType,
      accessTiers: accessTiers,
    );

    if (newChat != null) {
      // Refresh the group chat list to include the new chat
      await getGroupChats(isRefresh: true, isNotify: true);
    }

    return newChat;
  }

  Future<ChatModel?> createDirectChat(String participantId, String creatorId) async {
    final chat = await _chatRepository.createDirectChat(participantId, creatorId);
    if (chat != null) {
      getChats(isRefresh: true, isFromCache: false, isNotify: true);
    }
    return chat;
  }

  Future<List<Subscriber>> searchSubscribers(String query) {
    return _chatRepository.searchSubscribers(query);
  }
}
