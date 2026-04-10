import 'dart:async';

import 'package:google_sign_in/google_sign_in.dart';

import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';
import 'package:patreon-clone/backend/common/api_response.dart';

class AuthenticationRepository {
  final ApiService _apiService = ApiService();

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  /// Handles the native Google Sign-In popup.
  Future<GoogleSignInAccount?> getGoogleAccount() async {
    MyPrint.printOnConsole("AuthenticationRepository().getGoogleAccount() called");
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        MyPrint.printOnConsole("Google Sign In cancelled by user");
        return null;
      }
      return googleUser;
    } catch (e) {
      MyPrint.printOnConsole("Error getting Google Account: $e");
      return null;
    }
  }

  /// Sends the access token to backend for verification and login.
  Future<Result<Map<String, dynamic>>> loginWithGoogleBackend(String accessToken) async {
    MyPrint.printOnConsole("AuthenticationRepository().loginWithGoogleBackend() called");

    final response = await _apiService.post(
      ApiEndpoints.authGoogleMobile,
      body: {'accessToken': accessToken},
      includeAuth: false,
    );

    if (response.success) {
      return Result.fromSuccess(response);
    } else {
      return Result.fromFailure(response);
    }
  }

  /// Checks if email already exists in the system.
  Future<Result<Map<String, dynamic>>> checkEmailExists(String email) async {
    MyPrint.printOnConsole("AuthenticationRepository().checkEmailExists() called for $email");

    final encodedEmail = Uri.encodeComponent(email.toLowerCase());
    final response = await _apiService.get(
      ApiEndpoints.authCheckEmail(encodedEmail),
      includeAuth: false,
    );

    if (response.success && response.data != null) {
      return Result.ok({
        'isInUse': response.data!['isInUse'] ?? false,
        'passwordSet': response.data!['passwordSet'] ?? false,
      });
    }
    return Result.fromFailure(response);
  }

  /// Signs in with email and password.
  Future<Result<Map<String, dynamic>>> signInWithEmail({
    required String email,
    required String password,
  }) async {
    MyPrint.printOnConsole("AuthenticationRepository().signInWithEmail() called");

    final response = await _apiService.post(
      ApiEndpoints.authLogin,
      body: {
        'email': email,
        'password': password,
      },
      includeAuth: false,
    );

    if (response.success && response.data != null) {
      return Result.ok({
        'token': response.data!['token'],
        'userData': response.data!['user'],
      });
    }
    return Result.fromFailure(response);
  }

  /// Registers a new user.
  Future<Result<Map<String, dynamic>>> registerNewUser(UserModel userModel) async {
    MyPrint.printOnConsole("Register Request Payload: ${userModel.toMap()}");

    final response = await _apiService.post(
      ApiEndpoints.authRegister,
      body: userModel.toMap(),
      includeAuth: false,
    );

    if (response.success) {
      return Result.fromSuccess(response);
    } else {
      return Result.fromFailure(response);
    }
  }

  /// Gets user data from a valid token.
  Future<Result<UserModel>> getUserFromToken(String token) async {
    final response = await _apiService.get(
      ApiEndpoints.authUser,
      customHeaders: {'Authorization': 'Bearer $token'},
      includeAuth: false, // Using custom token instead
    );

    if (response.success && response.data != null) {
      return Result.ok(UserModel.fromMap(response.data!));
    }
    return Result.fromFailure(response);
  }

  /// Signs out from Google.
  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (e) {
      MyPrint.printOnConsole("Error signing out from Google: $e");
    }
  }
}
