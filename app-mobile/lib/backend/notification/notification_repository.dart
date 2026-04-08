import 'dart:io';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';
import 'package:patreon-clone/utils/my_print.dart';

class NotificationRepository {
  final ApiService _apiService = ApiService();

  Future<void> uploadDeviceToken(String fcmToken) async {
    try {
      final authToken = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final userId = await SharedPrefManager().getString(SharedPreferenceConstants.userId);

      if (fcmToken.isEmpty || authToken == null || userId == null) {
        MyPrint.printOnConsole("NotificationRepository: ❌ FCM token or auth token/user ID is missing.");
        return;
      }

      final response = await _apiService.post(
        ApiEndpoints.pushNotificationsStoreToken,
        body: {
          'userId': userId,
          'token': fcmToken,
          'platform': Platform.isIOS ? 'ios' : 'android',
        },
      );

      if (response.success) {
        await SharedPrefManager().setString(SharedPreferenceConstants.fcmToken, fcmToken);
        MyPrint.printOnConsole("NotificationRepository: ✅ FCM token uploaded successfully.");
      } else {
        MyPrint.printOnConsole(
            "NotificationRepository: ❌ Failed to upload FCM token: ${response.statusCode} - ${response.errorMessage}");
      }
    } catch (e) {
      MyPrint.printOnConsole("NotificationRepository: ❌ Exception in uploadDeviceToken: $e");
    }
  }

  Future<Map<String, dynamic>> getNotifications({
    required int page,
    required int limit,
    required String userMode,
  }) async {
    return await _apiService.getOrThrow(
      ApiEndpoints.notifications,
      queryParams: {
        'page': page.toString(),
        'limit': limit.toString(),
        'userMode': userMode,
      },
    );
  }
}
