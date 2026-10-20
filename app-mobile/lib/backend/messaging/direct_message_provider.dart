import 'package:patreon_clone/backend/common/common_provider.dart';
import 'package:patreon_clone/models/chat/chat_model.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/message/message_data_model.dart';
import 'package:patreon_clone/models/user/data_model/user_model.dart';

class ChatItem {
  final ChatModel chat;
  final UserModel otherUser;
  final UserModel creator;
  final List<UserModel> allParticipants;
  final MessageModel? lastMessage;
  final int unreadCount;

  ChatItem({
    required this.chat,
    required this.otherUser,
    required this.creator,
    required this.allParticipants,
    this.lastMessage,
    this.unreadCount = 0,
  });
}

class DirectMessageProvider extends CommonProvider {
  DirectMessageProvider() {
    chats = CommonProviderListParameter<ChatItem>(list: [], notify: notify);
    groupChats = CommonProviderListParameter<ChatItem>(list: [], notify: notify);
    messages = CommonProviderListParameter<MessageModel>(list: [], notify: notify);
    selectedChat = CommonProviderPrimitiveParameter<ChatItem?>(value: null, notify: notify);
    messagesPaginationModel = CommonProviderPrimitiveParameter(
      value: APIDocumentsPaginatedListModel<MessageModel>(
        contentsDocumentLimit: 5,
        contentsDocumentRefreshLimit: 10,
      ),
      notify: notify,
    );
    messagesPaginationMap = CommonProviderMapParameter<String, APIDocumentsPaginatedListModel<MessageModel>>(
      map: {},
      notify: notify,
    );
    isChatsLoading = CommonProviderPrimitiveParameter<bool>(
      value: false,
      notify: notify,
    );
  }

  late CommonProviderListParameter<ChatItem> chats;
  late CommonProviderListParameter<ChatItem> groupChats;
  late CommonProviderListParameter<MessageModel> messages;
  late CommonProviderPrimitiveParameter<ChatItem?> selectedChat;
  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<MessageModel>> messagesPaginationModel;
  late CommonProviderMapParameter<String, APIDocumentsPaginatedListModel<MessageModel>> messagesPaginationMap;
  late CommonProviderPrimitiveParameter<bool> isChatsLoading;

  void resetData({bool isNotify = true}) {
    chats.setList(list: [], isNotify: false);
    groupChats.setList(list: [], isNotify: false);
    messages.setList(list: [], isNotify: false);
    selectedChat.set(value: null, isNotify: false);
    messagesPaginationModel.set(
      value: APIDocumentsPaginatedListModel<MessageModel>(
        contentsDocumentLimit: 5,
        contentsDocumentRefreshLimit: 10,
      ),
      isNotify: false,
    );
    isChatsLoading.set(value: false, isNotify: isNotify);
    messagesPaginationMap.setMap(map: {}, isNotify: false);
    notify(isNotify: isNotify);
  }
}
