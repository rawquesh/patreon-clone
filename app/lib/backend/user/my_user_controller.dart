import 'dart:io';

import 'package:patreon-clone/backend/user/user_repository.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';

import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';

import 'package:patreon-clone/backend/authentication/authentication_provider.dart';

class MyUserController {
  late UserRepository _userRepository;
  late AuthenticationProvider _authenticationProvider;

  MyUserController({
    UserRepository? repository,
    AuthenticationProvider? authenticationProvider,
  }) {
    _userRepository = repository ?? UserRepository();
    _authenticationProvider = authenticationProvider ?? AuthenticationProvider();
  }

  Future<String?> uploadCoverImage({required File imageFile}) async {
    const tag = 'uploadCoverImage';
    try {
      String? token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final url = await _userRepository.uploadProfileCover(
        token: token,
        imageFile: imageFile,
      );
      if (url != null && url.isNotEmpty) {
        final userModel = _authenticationProvider.userModel.get();
        if (userModel != null) {
          userModel.profileCover = url;
          _authenticationProvider.userModel.set(value: userModel, isNotify: true);
        }
      }
      return url;
    } catch (e) {
      MyPrint.printOnConsole('Error uploading cover image: $e', tag: tag);
      return null;
    }
  }

  Future<String?> uploadProfileImage({required File imageFile}) async {
    const tag = 'uploadProfileImage';
    try {
      String? token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final url = await _userRepository.uploadProfilePhoto(
        token: token,
        imageFile: imageFile,
      );
      if (url != null && url.isNotEmpty) {
        final userModel = _authenticationProvider.userModel.get();
        if (userModel != null) {
          userModel.profilePicture = url;
          _authenticationProvider.userModel.set(value: userModel, isNotify: true);
        }
      }
      return url;
    } catch (e) {
      MyPrint.printOnConsole('Error uploading profile image: $e', tag: tag);
      return null;
    }
  }

  Future<bool> updateCreatorHeadline({required String headline}) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final updatedUser = await _userRepository.updateCreatorHeadline(token: token, headline: headline);

      if (updatedUser != null) {
        _authenticationProvider.userModel.set(value: updatedUser, isNotify: true);
        return true;
      }
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateCreatorHeadline: $e");
    }
    return false;
  }

  Future<Map<String, dynamic>> resetPassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      return await _userRepository.resetPassword(
        token: token,
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      );
    } catch (e) {
      MyPrint.printOnConsole('Error resetting password: $e');
      return {
        'success': false,
        'message': 'Error resetting password',
        'statusCode': 500,
      };
    }
  }

  Future<bool> updateContentVisibility({required String visibility}) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final updatedUser = await _userRepository.updateContentVisibility(
        token: token,
        contentVisibleTo: visibility,
      );

      if (updatedUser != null) {
        _authenticationProvider.userModel.set(value: updatedUser, isNotify: true);
        return true;
      }
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateContentVisibility: $e");
    }
    return false;
  }

  Future<bool> updateCreatorCategory({required String category}) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final updatedUser = await _userRepository.updateCreatorCategory(
        token: token,
        category: category,
      );

      if (updatedUser != null) {
        _authenticationProvider.userModel.set(value: updatedUser, isNotify: true);
        return true;
      }
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateCreatorCategory: $e");
    }
    return false;
  }

  Future<bool> updateNotificationSettings({
    required bool notifyOnNewPost,
    required bool notifyOnDirectMessages,
  }) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final result = await _userRepository.updateNotificationSettings(
        token: token,
        notifyOnNewPost: notifyOnNewPost,
        notifyOnDirectMessages: notifyOnDirectMessages,
      );

      if (result != null) {
        final userModel = _authenticationProvider.userModel.get();
        if (userModel != null) {
          userModel.memberNotifyOnNewPost = result['memberNotifyOnNewPost'] ?? userModel.memberNotifyOnNewPost;
          userModel.memberNotifyOnDirectMessages =
              result['memberNotifyOnDirectMessages'] ?? userModel.memberNotifyOnDirectMessages;
          _authenticationProvider.userModel.set(value: userModel, isNotify: true);
        }
        return true;
      }
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateNotificationSettings: $e");
    }
    return false;
  }

  Future<bool> updateCreatorNotificationSettings({
    required bool creatorNotifyOnNewUserJoined,
    required bool creatorNotifyOnCommentsAndRepliesOnPosts,
    required bool creatorNotifyOnDirectMessages,
  }) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final result = await _userRepository.updateCreatorNotificationSettings(
        token: token,
        creatorNotifyOnNewUserJoined: creatorNotifyOnNewUserJoined,
        creatorNotifyOnCommentsAndRepliesOnPosts: creatorNotifyOnCommentsAndRepliesOnPosts,
        creatorNotifyOnDirectMessages: creatorNotifyOnDirectMessages,
      );

      if (result != null) {
        final userModel = _authenticationProvider.userModel.get();
        if (userModel != null) {
          userModel.creatorNotifyOnNewUserJoined =
              result['creatorNotifyOnNewUserJoined'] ?? userModel.creatorNotifyOnNewUserJoined;
          userModel.creatorNotifyOnCommentsAndRepliesOnPosts =
              result['creatorNotifyOnCommentsAndRepliesOnPosts'] ?? userModel.creatorNotifyOnCommentsAndRepliesOnPosts;
          userModel.creatorNotifyOnDirectMessages =
              result['creatorNotifyOnDirectMessages'] ?? userModel.creatorNotifyOnDirectMessages;
          _authenticationProvider.userModel.set(value: userModel, isNotify: true);
        }
        return true;
      }
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateCreatorNotificationSettings: $e");
    }
    return false;
  }
}
