import 'package:patreon-clone/constants/shared_preference_constants.dart';

import 'package:patreon-clone/models/creator/about_data/about_model.dart' show AboutModel;
// import 'package:patreon-clone/models/creator/about_data/about_model.dart';
import 'package:patreon-clone/models/social_link/social_links.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart' show UserModel;
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';
import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/creator_section/my_creator_page_repository.dart';

class MyCreatorPageController {
  Future<String?> publishCreator({required bool acceptTerms}) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      if (token == null || token.isEmpty) return null;

      final result = await MyCreatorPageRepository().publishCreator(
        token: token,
        acceptTerms: acceptTerms,
      );
      MyPrint.printOnConsole(
        "Creator published successfully: ${result != null ? result.toString() : 'null'}",
      );

      if (result != null) {
        if (result['user'] != null) {
          final updatedUser = UserModel.fromMap(result['user']);
          AuthenticationProvider().userModel.set(
                value: updatedUser,
                isNotify: true,
              );
        }
        return result['stripeOnboardingUrl'] as String?;
      }
    } catch (e) {
      MyPrint.printOnConsole('Error publishing creator: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> completeStripeOnboarding() async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      if (token == null || token.isEmpty) return null;

      final result = await MyCreatorPageRepository().completeStripeOnboarding(token: token);
      MyPrint.printOnConsole(
        "Stripe onboarding completed successfully: ${result != null ? result.toString() : 'null'}",
      );

      if (result != null && result['user'] != null) {
        final updatedUser = UserModel.fromMap(result['user']);
        AuthenticationProvider().userModel.set(
              value: updatedUser,
              isNotify: true,
            );
      }
      return result;
    } catch (e) {
      MyPrint.printOnConsole('Error completing onboarding: $e');
      return null;
    }
  }

  Future<bool> updateSocialLinks(List<SocialLinkModel> links) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      if (token == null || token.isEmpty) return false;

      final result = await MyCreatorPageRepository().updateSocialLinks(
        token: token,
        socialLinks: links,
      );

      if (result != null && result['user'] != null) {
        final updatedUser = UserModel.fromMap(result['user']);
        AuthenticationProvider().userModel.set(
              value: updatedUser,
              isNotify: true,
            );
      }

      return result != null;
    } catch (e) {
      MyPrint.printOnConsole('Error in controller while updating social links: $e');
      return false;
    }
  }

  Future<bool> updateAbout({
    String? introVideoUrl,
    String? bio,
    required List<SocialLinkModel> socialLinks,
  }) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      if (token == null || token.isEmpty) return false;

      final result = await MyCreatorPageRepository().updateAbout(
        token: token,
        introVideoUrl: introVideoUrl,
        bio: bio,
        socialLinks: socialLinks,
      );

      if (result != null) {
        UserModel? user = AuthenticationProvider().userModel.get();
        if (user != null) {
          user.introVideoUrl = result['introVideoUrl'] ?? user.introVideoUrl;
          user.bio = result['bio'] ?? user.bio;
          if (result['socialLinks'] is List) {
            user.socialLinks =
                (result['socialLinks'] as List).map((e) => SocialLinkModel.fromMap(Map<String, dynamic>.from(e))).toList();
          }
          AuthenticationProvider().userModel.set(value: user, isNotify: true);
        }
        return true;
      }

      return false;
    } catch (e) {
      MyPrint.printOnConsole('Error updating about details: $e');
      return false;
    }
  }

  Future<AboutModel?> fetchCreatorAbout(String username) async {
    try {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      if (token == null || token.isEmpty) return null;

      final result = await MyCreatorPageRepository().getCreatorAbout(
        token: token,
        username: username,
      );

      if (result != null) {
        return AboutModel.fromMap(result);
      }
    } catch (e) {
      MyPrint.printOnConsole('Error fetching creator about: $e');
    }
    return null;
  }
}
