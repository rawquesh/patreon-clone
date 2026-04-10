import 'dart:io';

import 'package:patreon-clone/backend/user/user_repository.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';

import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';

import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/common/api_response.dart';

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

  Future<Result<String>> uploadCoverImage({required File imageFile}) async {
    const tag = 'uploadCoverImage';
    try {
      String? token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final result = await _userRepository.uploadProfileCover(
        token: token,
        imageFile: imageFile,
      );
      if (result.isSuccess && result.data != null && result.data!.isNotEmpty) {
        final userModel = _authenticationProvider.userModel.get();
        if (userModel != null) {
          userModel.profileCover = result.data!;
          _authenticationProvider.userModel.set(value: userModel, isNotify: true);
        }
        return result;
      }
      return result;
    } catch (e) {
      MyPrint.printOnConsole('Error uploading cover image: $e', tag: tag);
      return Result.fail(e.toString());
    }
  }

  Future<Result<String>> uploadProfileImage({required File imageFile}) async {
    const tag = 'uploadProfileImage';
    try {
      String? token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final result = await _userRepository.uploadProfilePhoto(
        token: token,
        imageFile: imageFile,
      );
      if (result.isSuccess && result.data != null && result.data!.isNotEmpty) {
        final userModel = _authenticationProvider.userModel.get();
        if (userModel != null) {
          userModel.profilePicture = result.data!;
          _authenticationProvider.userModel.set(value: userModel, isNotify: true);
        }
      }
      return result;
    } catch (e) {
      MyPrint.printOnConsole('Error uploading profile image: $e', tag: tag);
      return Result.fail(e.toString());
    }
  }

  Future<Result<void>> updateCreatorHeadline({required String headline}) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final result = await _userRepository.updateCreatorHeadline(token: token, headline: headline);

      if (result.isSuccess && result.data != null) {
        _authenticationProvider.userModel.set(value: result.data!, isNotify: true);
        return Result.ok(null);
      }
      return Result.fail(result.errorMessage ?? 'Failed to update headline');
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateCreatorHeadline: $e");
      return Result.fail(e.toString());
    }
  }

  Future<Result<Map<String, dynamic>>> resetPassword({
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
      return Result.fail(e.toString());
    }
  }

  Future<Result<void>> updateContentVisibility({required String visibility}) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final result = await _userRepository.updateContentVisibility(
        token: token,
        contentVisibleTo: visibility,
      );

      if (result.isSuccess && result.data != null) {
        _authenticationProvider.userModel.set(value: result.data!, isNotify: true);
        return Result.ok(null);
      }
      return Result.fail(result.errorMessage ?? 'Failed to update content visibility');
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateContentVisibility: $e");
      return Result.fail(e.toString());
    }
  }

  Future<Result<void>> updateCreatorCategory({required String category}) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      final result = await _userRepository.updateCreatorCategory(
        token: token,
        category: category,
      );

      if (result.isSuccess && result.data != null) {
        _authenticationProvider.userModel.set(value: result.data!, isNotify: true);
        return Result.ok(null);
      }
      return Result.fail(result.errorMessage ?? 'Failed to update creator category');
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateCreatorCategory: $e");
      return Result.fail(e.toString());
    }
  }

  Future<Result<void>> updateNotificationSettings({
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

      if (result.isSuccess && result.data != null) {
        final userModel = _authenticationProvider.userModel.get();
        if (userModel != null) {
          final data = result.data!;
          userModel.memberNotifyOnNewPost = data['memberNotifyOnNewPost'] ?? userModel.memberNotifyOnNewPost;
          userModel.memberNotifyOnDirectMessages =
              data['memberNotifyOnDirectMessages'] ?? userModel.memberNotifyOnDirectMessages;
          _authenticationProvider.userModel.set(value: userModel, isNotify: true);
        }
        return Result.ok(null);
      }
      return Result.fail(result.errorMessage ?? 'Failed to update notification settings');
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateNotificationSettings: $e");
      return Result.fail(e.toString());
    }
  }

  Future<Result<void>> updateCreatorNotificationSettings({
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

      if (result.isSuccess && result.data != null) {
        final userModel = _authenticationProvider.userModel.get();
        if (userModel != null) {
          final data = result.data!;
          userModel.creatorNotifyOnNewUserJoined =
              data['creatorNotifyOnNewUserJoined'] ?? userModel.creatorNotifyOnNewUserJoined;
          userModel.creatorNotifyOnCommentsAndRepliesOnPosts =
              data['creatorNotifyOnCommentsAndRepliesOnPosts'] ?? userModel.creatorNotifyOnCommentsAndRepliesOnPosts;
          userModel.creatorNotifyOnDirectMessages =
              data['creatorNotifyOnDirectMessages'] ?? userModel.creatorNotifyOnDirectMessages;
          _authenticationProvider.userModel.set(value: userModel, isNotify: true);
        }
        return Result.ok(null);
      }
      return Result.fail(result.errorMessage ?? 'Failed to update notification settings');
    } catch (e) {
      MyPrint.printOnConsole("Exception in updateCreatorNotificationSettings: $e");
      return Result.fail(e.toString());
    }
  }
}
