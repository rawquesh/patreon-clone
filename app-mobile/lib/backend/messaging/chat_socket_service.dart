import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:patreon_clone/constants/constants.dart';
import 'package:patreon_clone/utils/my_print.dart';

class ChatSocketService {
  static final ChatSocketService _instance = ChatSocketService._internal();

  factory ChatSocketService() => _instance;

  ChatSocketService._internal();

  io.Socket? _socket;
  Function(dynamic)? _currentNewMessageHandler;

  Future<void> connect({required String token}) async {
    if (_socket != null && _socket!.connected) {
      MyPrint.printOnConsole('Socket already connected');
      return;
    }
    MyPrint.printOnConsole('Connecting socket...');
    _socket = io.io(
      '${ApiUrls.prodBaseUrl}/chat',
      <String, dynamic>{
        'transports': ['websocket'],
        'autoConnect': true,
        'auth': {'token': token},
      },
    );

    // Attach event logs for connection lifecycle
    _socket!.on('connect', (_) {
      MyPrint.printOnConsole('Socket connected!');
      // Re-setup message handler after connection if it exists
      if (_currentNewMessageHandler != null) {
        MyPrint.printOnConsole('Setting up new_message handler after connection');
        _setupNewMessageHandler(_currentNewMessageHandler!);
      }
    });
    _socket!.on('disconnect', (_) => MyPrint.printOnConsole('Socket disconnected!'));
    _socket!.on('connect_error', (err) => MyPrint.printOnConsole('Socket connect error: $err'));
    _socket!.on('error', (err) => MyPrint.printOnConsole('Socket general error: $err'));

    _socket!.connect();
  }

  void disconnect() {
    MyPrint.printOnConsole('Disconnecting socket...');
    _currentNewMessageHandler = null;
    _socket?.disconnect();
    _socket = null;
  }

  void joinChat(String chatId) {
    MyPrint.printOnConsole('Joining chat: $chatId');
    if (_socket == null || !_socket!.connected) {
      MyPrint.printOnConsole('Cannot join chat - socket not connected');
      return;
    }
    _socket?.emit('join_chat', {'chatId': chatId});
    MyPrint.printOnConsole('Join chat event emitted for: $chatId');
  }

  void leaveChat(String chatId) {
    MyPrint.printOnConsole('Leaving chat: $chatId');
    _socket?.emit('leave_chat', {'chatId': chatId});
  }

  void sendMessage(String chatId, String message) {
    MyPrint.printOnConsole('Sending message to $chatId: $message');
    _socket?.emit('send_message', {
      'chatId': chatId,
      'message': {'content': message},
    });
  }

  void _setupNewMessageHandler(Function(dynamic) handler) {
    if (_socket == null || !_socket!.connected) {
      MyPrint.printOnConsole('Cannot setup handler - socket not connected');
      return;
    }

    MyPrint.printOnConsole('Setting up new_message event listener');
    // Remove any existing handler first
    _socket?.off('new_message');

    // Add the new handler with logging
    _socket?.on('new_message', (data) {
      MyPrint.printOnConsole('Received new_message event with data: $data');
      handler(data);
    });

    MyPrint.printOnConsole('new_message handler attached successfully');
  }

  void onNewMessage(Function(dynamic) handler) {
    MyPrint.printOnConsole('Setting up new_message handler');
    _currentNewMessageHandler = handler;

    if (_socket != null) {
      if (_socket!.connected) {
        MyPrint.printOnConsole('Socket is connected, setting up handler immediately');
        _setupNewMessageHandler(handler);
      } else {
        MyPrint.printOnConsole('Socket not connected yet, handler will be set up on connection');
      }
    } else {
      MyPrint.printOnConsole('Socket is null, handler will be set up when socket connects');
    }
  }

  void offNewMessage() {
    MyPrint.printOnConsole('Removing new_message handler');
    _currentNewMessageHandler = null;
    _socket?.off('new_message');
  }

  // Add a method to check socket status
  bool get isConnected => _socket?.connected ?? false;

  // Add a method to manually trigger a test event (for debugging)
  void testConnection() {
    MyPrint.printOnConsole('Testing socket connection...');
    MyPrint.printOnConsole('Socket connected: ${_socket?.connected}');
    MyPrint.printOnConsole('Socket ID: ${_socket?.id}');

    // Test if we can emit a simple event
    _socket?.emit('ping', {'timestamp': DateTime.now().millisecondsSinceEpoch});
  }
}
