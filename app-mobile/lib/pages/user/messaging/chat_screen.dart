import 'dart:io';

import 'package:flutter/material.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';
import 'package:patreon-clone/styles/styles.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon-clone/models/message/message_data_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon-clone/helpers/image_helper.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import 'package:patreon-clone/backend/common/dependency_injection.dart';
import 'package:patreon-clone/backend/messaging/direct_message_controller.dart';
import 'package:patreon-clone/backend/messaging/direct_message_provider.dart';
import 'components/message_bubble.dart';

import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';

class ChatScreen extends StatefulWidget {
  final ChatItem chat;

  const ChatScreen({super.key, required this.chat});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with MySafeState {
  late DirectMessageProvider messageProvider;
  late DirectMessageController messageController;
  Function(dynamic)? _socketHandler;
  TextEditingController textController = TextEditingController();
  ScrollController scrollController = ScrollController();
  String currentUserId = "";
  bool _isLoading = false;
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();

  File? _pendingImageFile;

  bool get _canSend => (textController.text.trim().isNotEmpty) || (_pendingImageFile != null);

  @override
  void initState() {
    super.initState();
    messageProvider = context.read<DirectMessageProvider>();
    messageController = DirectMessageController(provider: messageProvider);
    _setupScrollListener();
    _loadMessages();
    _getCurrentUserId();
    _setupSocket();
  }

  void _getCurrentUserId() async {
    await _ensureCurrentUserId(shouldSetState: true);
  }

  Future<void> _ensureCurrentUserId({bool shouldSetState = false}) async {
    _refreshCurrentUserIdSync(shouldSetState: shouldSetState);
    if (currentUserId.isNotEmpty) return;

    final prefId = await _sharedPrefManager.getString(SharedPreferenceConstants.userId);
    final resolvedPrefId = prefId ?? '';
    if (resolvedPrefId.isNotEmpty && resolvedPrefId != currentUserId) {
      currentUserId = resolvedPrefId;
      if (shouldSetState) mySetState();
    }
  }

  void _refreshCurrentUserIdSync({bool shouldSetState = false}) {
    final resolvedId = _resolveCurrentUserIdSync();
    if (resolvedId.isNotEmpty && resolvedId != currentUserId) {
      currentUserId = resolvedId;
      if (shouldSetState) mySetState();
    }
  }

  String _resolveCurrentUserIdSync() {
    final providerId = DependencyInjection.authenticationProvider.userId.get();
    if (providerId.isNotEmpty) return providerId;

    final userModel = DependencyInjection.authenticationProvider.userModel.get();
    if (userModel != null && userModel.userId.isNotEmpty) {
      return userModel.userId;
    }

    return currentUserId;
  }

  void _clearPendingImage() {
    _pendingImageFile = null;
    mySetState();
  }

  Future<void> _pickImageForComposer() async {
    try {
      var xfile = await ImageHelper.pickAndProcessImage(context: context);

      if (xfile == null) return;
      _pendingImageFile = File(xfile.path);
      mySetState();
    } catch (e, s) {
      MyPrint.printOnConsole('Image pick failed: $e');
      MyPrint.printOnConsole(s);
    }
  }

  void _setupScrollListener() {
    scrollController.addListener(() {
      double threshold = 100;
      double maxExtent = scrollController.position.maxScrollExtent;
      if (scrollController.position.pixels >= maxExtent - threshold) {
        _loadMoreMessages();
      }
    });
  }

  void _setupSocket() async {
    await _ensureCurrentUserId();
    _socketHandler = await messageController.connectAndJoinChat(
      widget.chat.chat.id,
      (MessageModel msg) {
        _refreshCurrentUserIdSync();
        _handleIncomingMessage(msg);
      },
    );
  }

  void _loadMessages() {
    final chatId = widget.chat.chat.id;

    final map = messageProvider.messagesPaginationMap.getMap(isNewInstance: false);
    APIDocumentsPaginatedListModel<MessageModel>? cachedModel = map[chatId];

    bool useCache = cachedModel != null && cachedModel.contentsLength > 0;

    cachedModel ??= APIDocumentsPaginatedListModel<MessageModel>(
      contentsDocumentLimit: 5,
      contentsDocumentRefreshLimit: 10,
    );

    map[chatId] = cachedModel;

    messageProvider.messagesPaginationModel.set(value: cachedModel, isNotify: false);
    messageProvider.messages.setList(list: cachedModel.contentsList.getList(), isClear: true, isNotify: false);
    messageProvider.selectedChat.set(value: widget.chat, isNotify: false);

    messageController
        .getChatMessagesPaginatedList(
      chatId: chatId,
      isRefresh: !useCache,
      isFromCache: useCache,
      isNotify: true,
    )
        .then((_) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    });
  }

  void _loadMoreMessages() {
    final paginationModel = messageProvider.messagesPaginationModel.get();
    if (paginationModel.hasMoreContents.get() && !paginationModel.isContentsLoading.get()) {
      messageController.getChatMessagesPaginatedList(
        chatId: widget.chat.chat.id,
        isRefresh: false,
        isFromCache: false,
        isNotify: true,
      );
    }
  }

  void _scrollToBottom() {
    if (scrollController.hasClients) {
      scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() async {
    await _ensureCurrentUserId();
    _isLoading = true;
    mySetState();

    final chatId = widget.chat.chat.id;
    final text = textController.text.trim();
    final hasImage = _pendingImageFile != null;

    if (!hasImage && text.isEmpty) return;

    final contentToSend = text.isNotEmpty ? text : ' ';

    await messageController.sendMessage(
      chatId,
      contentToSend,
      attachmentFile: _pendingImageFile,
    );

    textController.clear();
    _pendingImageFile = null;
    _isLoading = false;
    mySetState();

    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  String formatMessageTime(DateTime dateTime) {
    final now = DateTime.now();
    final localDateTime = dateTime.toLocal();

    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final messageDate = DateTime(localDateTime.year, localDateTime.month, localDateTime.day);

    if (messageDate == today) {
      return DateFormat.jm().format(localDateTime);
    } else if (messageDate == yesterday) {
      return DateFormat.jm().format(localDateTime);
    } else if (localDateTime.year == now.year) {
      return DateFormat("d MMM, h:mm a").format(localDateTime);
    } else {
      return DateFormat("d MMM yyyy, h:mm a").format(localDateTime);
    }
  }

  @override
  void dispose() {
    if (_socketHandler != null) {
      messageController.leaveChat(widget.chat.chat.id, _socketHandler!);
    }
    scrollController.dispose();
    textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    MyPrint.printOnConsole('userId: $currentUserId', tag: 'ChatScreen');

    MyPrint.printOnConsole("Chats Screen Group data: ${widget.chat.otherUser.toString()}");
    super.pageBuild();
    bool isGroupChat = widget.chat.chat.type == 'group';

    return ModalProgressHUD(
      inAsyncCall: _isLoading,
      child: Scaffold(
        appBar: AppBar(
          centerTitle: false,
          backgroundColor: Styles.scaffoldBackground,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(
              Icons.chevron_left,
              color: Colors.black,
              size: 32,
            ),
            onPressed: () => context.pop(),
          ),
          title: Row(
            children: [
              isGroupChat
                  ? CircleAvatar(
                      radius: 20,
                      backgroundColor: Colors.grey[300],
                      child: Icon(Icons.group, color: Colors.grey[600]),
                    )
                  : widget.chat.otherUser.profilePicture.isNotEmpty
                      ? CommonCachedNetworkImage(
                          imageUrl: widget.chat.otherUser.profilePicture,
                          height: 40,
                          width: 40,
                          fit: BoxFit.cover,
                          borderRadius: 20,
                        )
                      : CircleAvatar(
                          radius: 20,
                          backgroundColor: Colors.grey[300],
                          child: Text(
                            widget.chat.otherUser.displayName.isNotEmpty
                                ? widget.chat.otherUser.displayName[0].toUpperCase()
                                : '',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
              const SizedBox(width: 12),
              Text(
                isGroupChat ? widget.chat.chat.title : widget.chat.otherUser.displayName,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
            ],
          ),
          actions: [
            if (isGroupChat)
              IconButton(
                icon: const Icon(Icons.info_outline, color: Colors.black),
                onPressed: () {
                  context.pushNamed(
                    Routes.groupChatDetails,
                    extra: {'chat': widget.chat},
                  );
                },
              ),
          ],
        ),
        body: Column(
          children: [
            Expanded(
              child: Consumer<DirectMessageProvider>(
                builder: (context, provider, child) {
                  final messages = provider.messages.getList();
                  final paginationModel = provider.messagesPaginationModel.get();
                  final isLoading = paginationModel.isContentsLoading.get();
                  final isFirstTimeLoading = paginationModel.isContentsFirstTimeLoading.get();

                  if (isFirstTimeLoading && messages.isEmpty) {
                    return const Center(
                      child: LoadingWidget(),
                    );
                  }
                  return Column(
                    children: [
                      if (isLoading && messages.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.all(12),
                          child: const Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          ),
                        ),
                      Expanded(
                        child: ListView.builder(
                          controller: scrollController,
                          padding: const EdgeInsets.all(12),
                          itemCount: messages.length,
                          reverse: true,
                          itemBuilder: (context, index) {
                            final message = messages[index];
                            final isMe = message.sender == currentUserId;
                            final bool showDateHeader;
                            if (index == messages.length - 1) {
                              showDateHeader = true;
                            } else {
                              final previousMessage = messages[index + 1];
                              final messageDate =
                                  DateTime(message.createdAt.year, message.createdAt.month, message.createdAt.day);
                              final previousMessageDate = DateTime(
                                  previousMessage.createdAt.year, previousMessage.createdAt.month, previousMessage.createdAt.day);
                              showDateHeader = messageDate != previousMessageDate;
                            }

                            return Column(
                              children: [
                                if (showDateHeader)
                                  Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    child: Text(
                                      _formatDateHeader(message.createdAt),
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                MessageBubble(
                                  message: message,
                                  isMe: isMe,
                                  chat: widget.chat,
                                  formatTime: formatMessageTime,
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            Container(
              padding: const EdgeInsets.all(12),
              margin: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Colors.grey[200]!)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_pendingImageFile != null) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.file(
                              _pendingImageFile!,
                              width: 60,
                              height: 60,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Selected image',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Add a caption or just send',
                                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            tooltip: 'Remove',
                            onPressed: _clearPendingImage,
                            icon: const Icon(Icons.close),
                          ),
                        ],
                      ),
                    ),
                  ],
                  Row(
                    children: [
                      Container(
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.image_outlined),
                          onPressed: _pickImageForComposer,
                          tooltip: 'Pick Image',
                        ),
                      ),
                      Expanded(
                        child: TextField(
                          controller: textController,
                          decoration: InputDecoration(
                            hintText: _pendingImageFile != null ? 'Add a caption...' : 'Type a message...',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(25),
                              borderSide: BorderSide.none,
                            ),
                            filled: true,
                            fillColor: Colors.grey[100],
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          ),
                          onChanged: (_) => mySetState(),
                          onSubmitted: (_) => _canSend ? _sendMessage() : null,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Opacity(
                        opacity: _canSend ? 1.0 : 0.5,
                        child: Container(
                          decoration: BoxDecoration(
                            color: themeData.primaryColor,
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.send, color: Colors.white),
                            onPressed: _canSend ? _sendMessage : null,
                            tooltip: 'Send',
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDateHeader(DateTime dateTime) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final messageDate = DateTime(dateTime.year, dateTime.month, dateTime.day);

    if (messageDate == today) {
      return 'TODAY';
    } else if (messageDate == today.subtract(const Duration(days: 1))) {
      return 'YESTERDAY';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }

  void _handleIncomingMessage(MessageModel msg) {
    final chatId = widget.chat.chat.id;
    final map = messageProvider.messagesPaginationMap.getMap(isNewInstance: false);
    APIDocumentsPaginatedListModel<MessageModel> paginated = map[chatId] ??
        APIDocumentsPaginatedListModel<MessageModel>(
          contentsDocumentLimit: 5,
          contentsDocumentRefreshLimit: 10,
        );

    final List<MessageModel> currentMessages = paginated.contentsList.getList();

    final existingIndex = currentMessages.indexWhere((element) => element.id == msg.id);

    if (existingIndex != -1) {
      currentMessages[existingIndex] = msg;
    } else {
      final optimisticIndex = _findOptimisticMatchIndex(
        currentMessages,
        msg,
        _resolveCurrentUserIdSync(),
      );

      if (optimisticIndex != -1) {
        currentMessages[optimisticIndex] = msg;
      } else {
        currentMessages.insert(0, msg);
      }
    }

    paginated.contentsList.setList(list: currentMessages, isClear: true, isNotify: false);
    map[chatId] = paginated;

    if (messageProvider.selectedChat.get()?.chat.id == chatId) {
      messageProvider.messagesPaginationModel.set(value: paginated, isNotify: false);
      messageProvider.messages.setList(
        list: currentMessages,
        isClear: true,
        isNotify: true,
      );
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    }
  }

  int _findOptimisticMatchIndex(
    List<MessageModel> currentMessages,
    MessageModel incoming,
    String myId,
  ) {
    if (myId.isEmpty || incoming.sender != myId) return -1;

    for (int index = 0; index < currentMessages.length; index++) {
      final message = currentMessages[index];
      if (!message.id.startsWith('temp-')) continue;
      if (message.sender != myId) continue;

      final contentMatches = message.content.trim() == incoming.content.trim();
      final attachmentCountMatches = message.attachments.length == incoming.attachments.length;
      final timeDifferenceSeconds = message.createdAt.difference(incoming.createdAt).inSeconds.abs();

      if ((contentMatches || attachmentCountMatches) && timeDifferenceSeconds <= 5) {
        return index;
      }
    }

    return -1;
  }
}
