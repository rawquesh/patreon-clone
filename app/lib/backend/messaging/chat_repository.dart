import 'package:patreon-clone/constants/constants.dart';
import 'package:patreon-clone/models/chat/chat_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/models/audience/subscriber.dart';

import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';

class ChatRepository {
  final ApiService _apiService = ApiService();

  /// Creates a new group chat on the server.
  Future<ChatModel?> createGroupChat({
    required String title,
    String? description,
    required String accessType,
    List<String>? accessTiers,
  }) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.chatGroup,
        body: {
          'title': title,
          'description': description ?? '',
          'accessType': accessType,
          'accessTiers': accessType == ChatAccessTypes.select ? accessTiers ?? [] : [],
        },
      );

      MyPrint.printOnConsole('Create Group Chat Response: ${response.statusCode}');

      if (response.success && response.data != null) {
        return ChatModel.fromMap(response.data!);
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error creating group chat: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }

  Future<ChatModel?> createDirectChat(String participantId, String creatorId) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.chatDirect,
        body: {'participantId': participantId, 'creatorId': creatorId},
      );

      MyPrint.printOnConsole('Create Direct Chat Response: ${response.statusCode}');

      if (response.success && response.data != null) {
        return ChatModel.fromMap(response.data!);
      }
    } catch (e) {
      MyPrint.printOnConsole('Error creating direct chat: $e');
    }
    return null;
  }

  Future<List<Subscriber>> searchSubscribers(String query) async {
    try {
      final response = await _apiService.get(
        ApiEndpoints.usersCreatorSubscribersSearch,
        queryParams: {'query': query},
      );

      if (response.success && response.data != null) {
        final data = response.data!['data'] as List?;
        if (data != null) {
          return data.map((item) => Subscriber.fromMap(item)).toList();
        }
      }
    } catch (e) {
      MyPrint.printOnConsole('Error searching subscribers: $e');
    }
    return [];
  }
}
