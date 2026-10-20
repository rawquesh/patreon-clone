import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
// import 'package:patreon_clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon_clone/navigation/navigation_type.dart';
import 'package:patreon_clone/constants/shared_preference_constants.dart';
import 'package:patreon_clone/constants/auth_constants.dart';
import 'package:patreon_clone/utils/extensions.dart';
import 'package:patreon_clone/managers/hive_manager.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/managers/shared_pref_manager.dart';
import 'package:patreon_clone/managers/deeplink_manager.dart';
import 'package:patreon_clone/managers/fcm_manager.dart';

import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';
import 'package:patreon_clone/backend/common/dependency_injection.dart';
import 'package:patreon_clone/backend/common/api_response.dart';
import 'authentication_provider.dart';
import 'authentication_repository.dart';

class AuthenticationController {
  late AuthenticationProvider _authenticationProvider;
  late AuthenticationRepository _authenticationRepository;
  String? _authToken;
  String? lastAuthError;

  AuthenticationController({
    AuthenticationProvider? authenticationProvider,
    AuthenticationRepository? repository,
  }) {
    _authenticationProvider = authenticationProvider ?? DependencyInjection.authenticationProvider;
    _authenticationRepository = repository ?? AuthenticationRepository();
  }

  AuthenticationProvider get authenticationProvider => _authenticationProvider;

  AuthenticationRepository get authenticationRepository => _authenticationRepository;

  Future<Result<void>> signInWithGoogle({
    required BuildContext context,
    required GoogleSignInAccount googleUser,
  }) async {
    try {
      final googleAuth = await googleUser.authentication;
      final accessToken = googleAuth.idToken;

      if (accessToken == null) {
        lastAuthError = 'Could not get access token from Google';
        return Result.fail(lastAuthError!);
      }

      final result = await _authenticationRepository.loginWithGoogleBackend(accessToken);

      if (!result.isSuccess) {
        lastAuthError = result.errorMessage ?? 'Sign in failed';
        return Result.fail(lastAuthError!);
      }

      final token = result.data?['token'] as String?;
      final userData = result.data?['user'] as Map<String, dynamic>?;

      if (token == null || userData == null) {
        lastAuthError = 'Invalid response from server';
        return Result.fail(lastAuthError!);
      }

      _authToken = token;

      await onLoginSuccess(
        context: context,
        authenticationMode: AuthenticationModes.google,
      );

      return Result.ok(null);
    } catch (e) {
      lastAuthError = e.toString();
      MyPrint.printOnConsole('Sign in error: $e');
      return Result.fail(lastAuthError!);
    }
  }

  Future<Result<void>> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final result = await _authenticationRepository.signInWithEmail(
        email: email,
        password: password,
      );

      if (!result.isSuccess) {
        lastAuthError = result.errorMessage ?? 'Login failed. Please try again.';
        return Result.fail(lastAuthError!);
      }

      final token = result.data?['token'] as String?;

      if (token == null) {
        lastAuthError = 'Invalid response from server';
        return Result.fail(lastAuthError!);
      }

      _authToken = token;
      return Result.ok(null);
    } catch (e) {
      lastAuthError = e.toString();
      MyPrint.printOnConsole('Email sign in error: $e');
      return Result.fail(lastAuthError!);
    }
  }

  Future<bool> isUserLoggedIn() async {
    String? token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
    String? userId = await SharedPrefManager().getString(SharedPreferenceConstants.userId);

    if (token == null || token.isEmpty || userId == null || userId.isEmpty) {
      return false;
    }

    try {
      final result = await _authenticationRepository.getUserFromToken(token);

      if (result.isSuccess && result.data != null) {
        final userModel = result.data!;
        _authenticationProvider.userId.set(value: userModel.userId, isNotify: false);
        _authenticationProvider.email.set(value: userModel.email, isNotify: false);
        _authenticationProvider.userModel.set(value: userModel, isNotify: true);
        _authToken = token;

        String loginSessionId =
            await SharedPrefManager().getString(SharedPreferenceConstants.loginSessionId) ?? MyUtils.getNewId();
        await SharedPrefManager().setString(SharedPreferenceConstants.loginSessionId, loginSessionId);
        _authenticationProvider.loginSessionId.set(value: loginSessionId, isNotify: false);

        return true;
      }

      await logout(isNavigateToLogin: false);
      return false;
    } catch (e) {
      MyPrint.printOnConsole('Error retrieving user from token: $e');
      return false;
    }
  }

  Future<void> onLoginSuccess({
    required BuildContext context,
    String authenticationMode = "",
  }) async {
    MyPrint.printOnConsole("called onLoginSuccess");

    final userResult = await authenticationRepository.getUserFromToken(_authToken ?? "");

    if (!userResult.isSuccess || userResult.data == null) {
      await logout(isNavigateToLogin: true);
      return;
    }

    final userModel = userResult.data!;

    if (userModel.email.isEmpty) {
      await logout(isNavigateToLogin: true);
      return;
    }

    authenticationProvider.userModel.set(value: userModel, isNotify: true);
    authenticationProvider.userId.set(value: userModel.userId, isNotify: false);
    authenticationProvider.email.set(value: userModel.email, isNotify: false);

    String loginSessionId = MyUtils.getNewId();
    await SharedPrefManager().setString(SharedPreferenceConstants.authToken, _authToken ?? "");
    await SharedPrefManager().setString(SharedPreferenceConstants.userId, userModel.userId);
    await SharedPrefManager().setString(SharedPreferenceConstants.loginSessionId, loginSessionId);
    authenticationProvider.loginSessionId.set(value: loginSessionId, isNotify: false);

    if (context.checkMounted() && context.mounted) {
      context.goNamed(Routes.main);
    }
  }

  // REMOVED: The checkUserWithIdExistOrNotAndIfNotExistThenCreate method is no longer needed.

  Future<bool> logout({
    bool isShowConfirmationDialog = false,
    bool isNavigateToLogin = false,
    bool isForceLogout = false,
    String forceLogoutMessage = "",
  }) async {
    MyPrint.printOnConsole("AuthenticationController().logout() called");

    await _authenticationRepository.signOut();
    _authToken = null;

    await SharedPrefManager().clearAll();
    DependencyInjection.directMessageProvider.resetData(isNotify: true);
    NotificationManager.instance.dispose();
    DeepLinkManager().dispose();
    HiveManager.clearAllData();
    authenticationProvider.resetData(isNotify: true);

    return true;
  }
}
