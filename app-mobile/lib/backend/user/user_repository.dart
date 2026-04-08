import 'dart:io';

import 'package:http_parser/http_parser.dart';

import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/models/user/request_model/profile_update_request_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';

class UserRepository {
  final ApiService _apiService = ApiService();

  Future<UserModel?> updateUserProfileFromModel({
    required String? token,
    required ProfileUpdateRequestModel data,
  }) async {
    final response = await _apiService.put(
      ApiEndpoints.usersProfile,
      body: data.toMap(),
    );

    if (response.success && response.data != null) {
      final userData = response.data!;
      return UserModel(
        userId: userData["_id"] ?? "",
        firstName: userData["firstName"] ?? "",
        lastName: userData["lastName"] ?? "",
        displayName: userData['displayName'],
        email: userData["email"] ?? "",
        authenticationMode: "email",
      );
    } else {
      MyPrint.printOnConsole(
        "Failed to update profile: ${response.statusCode} - ${response.errorMessage}",
      );
      return null;
    }
  }

  Future<String?> uploadProfilePhoto({
    required String? token,
    required File imageFile,
  }) async {
    MyPrint.printOnConsole('Upload Profile Photo started');

    final response = await _apiService.multipartRequest(
      method: 'PUT',
      endpoint: ApiEndpoints.usersProfilePhoto,
      files: [
        MultipartFileData.fromFile(
          field: 'photo',
          file: imageFile,
          filename: 'profile_photo.jpg',
          contentType: MediaType('image', 'jpeg'),
        ),
      ],
    );

    if (response.success && response.data != null) {
      final photoUrl = response.data!['profilePicture'] ?? '';
      MyPrint.printOnConsole('Uploaded photo URL: $photoUrl');
      return photoUrl;
    } else {
      MyPrint.printOnConsole(
        "Failed to upload profile photo: ${response.statusCode} - ${response.errorMessage}",
      );
      return null;
    }
  }

  Future<String?> uploadProfileCover({
    required String? token,
    required File imageFile,
  }) async {
    MyPrint.printOnConsole('Upload Profile Cover started');

    final response = await _apiService.multipartRequest(
      method: 'PUT',
      endpoint: ApiEndpoints.usersProfileCover,
      files: [
        MultipartFileData.fromFile(
          field: 'cover',
          file: imageFile,
          filename: 'cover_image.jpg',
          contentType: MediaType('image', 'jpeg'),
        ),
      ],
    );

    if (response.success && response.data != null) {
      final coverUrl = response.data!['profileCover'] ?? '';
      return coverUrl;
    } else {
      MyPrint.printOnConsole(
        "Failed to upload profile cover: ${response.statusCode} - ${response.errorMessage}",
      );
      return null;
    }
  }

  Future<UserModel?> updateCreatorHeadline({
    required String? token,
    required String headline,
  }) async {
    final response = await _apiService.put(
      ApiEndpoints.usersCreatorHeadline,
      body: {'headline': headline},
    );

    if (response.success && response.data != null) {
      return UserModel.fromMap(response.data!);
    } else {
      MyPrint.printOnConsole(
        "Failed to update headline: ${response.statusCode} - ${response.errorMessage}",
      );
      return null;
    }
  }

  Future<UserModel?> onboardCreator({
    required String token,
    required String username,
    required String contentVisibleTo,
    required String category,
  }) async {
    final response = await _apiService.post(
      ApiEndpoints.usersOnboardCreator,
      body: {
        'username': username,
        'contentVisibleTo': contentVisibleTo,
        'category': category,
      },
    );

    if (response.success && response.data != null) {
      MyPrint.printOnConsole("Creator onboarded successfully: ${response.data!['username']}");
      return UserModel.fromMap(response.data!);
    } else {
      MyPrint.printOnConsole(
        'Failed to onboard creator: ${response.statusCode} - ${response.errorMessage}',
      );
      return null;
    }
  }

  Future<Map<String, dynamic>> resetPassword({
    required String? token,
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final response = await _apiService.post(
      ApiEndpoints.usersResetPassword,
      body: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      },
    );

    if (response.success) {
      return {
        'success': true,
        'message': response.data?['message'] ?? 'Password changed successfully',
      };
    } else {
      MyPrint.printOnConsole('Failed to reset password: ${response.statusCode} - ${response.errorMessage}');
      return {
        'success': false,
        'message': response.errorMessage ?? 'Failed to reset password',
        'statusCode': response.statusCode,
      };
    }
  }

  Future<UserModel?> updateContentVisibility({
    required String? token,
    required String contentVisibleTo,
  }) async {
    final response = await _apiService.put(
      ApiEndpoints.usersContentVisibility,
      body: {'contentVisibleTo': contentVisibleTo},
    );

    if (response.success && response.data != null) {
      return UserModel.fromMap(response.data!);
    } else {
      MyPrint.printOnConsole(
        "Failed to update content visibility: ${response.statusCode} - ${response.errorMessage}",
      );
      return null;
    }
  }

  Future<UserModel?> updateCreatorCategory({
    required String? token,
    required String category,
  }) async {
    final response = await _apiService.put(
      ApiEndpoints.usersCreatorCategory,
      body: {'category': category},
    );

    if (response.success && response.data != null) {
      MyPrint.printOnConsole("Category updated successfully: $category");
      return UserModel.fromMap(response.data!);
    } else {
      MyPrint.printOnConsole(
        "Failed to update creator category: ${response.statusCode} - ${response.errorMessage}",
      );
      return null;
    }
  }

  Future<Map<String, dynamic>?> updateNotificationSettings({
    required String? token,
    required bool notifyOnNewPost,
    required bool notifyOnDirectMessages,
  }) async {
    final response = await _apiService.put(
      ApiEndpoints.notificationSettingsMember,
      body: {
        'memberNotifyOnNewPost': notifyOnNewPost,
        'memberNotifyOnDirectMessages': notifyOnDirectMessages,
      },
    );

    MyPrint.printOnConsole('Update Notification Settings Response: ${response.statusCode}');

    if (response.success) {
      return response.data;
    } else {
      MyPrint.printOnConsole(
        'Failed to update notification settings: ${response.statusCode} - ${response.errorMessage}',
      );
      return null;
    }
  }

  Future<Map<String, dynamic>?> updateCreatorNotificationSettings({
    required String? token,
    required bool creatorNotifyOnNewUserJoined,
    required bool creatorNotifyOnCommentsAndRepliesOnPosts,
    required bool creatorNotifyOnDirectMessages,
  }) async {
    final response = await _apiService.put(
      ApiEndpoints.notificationSettingsCreator,
      body: {
        'creatorNotifyOnNewMember': creatorNotifyOnNewUserJoined,
        'creatorNotifyOnComments': creatorNotifyOnCommentsAndRepliesOnPosts,
        'creatorNotifyOnDirectMessages': creatorNotifyOnDirectMessages,
      },
    );

    MyPrint.printOnConsole('Update Notification Settings Response: ${response.statusCode}');

    if (response.success) {
      return response.data;
    } else {
      MyPrint.printOnConsole(
        'Failed to update creator notification settings: ${response.statusCode} - ${response.errorMessage}',
      );
      return null;
    }
  }
}
