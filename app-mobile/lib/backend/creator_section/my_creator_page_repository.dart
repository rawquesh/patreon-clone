import 'package:patreon_clone/models/social_link/social_links.dart';
import 'package:patreon_clone/utils/my_print.dart';

import 'package:patreon_clone/backend/common/api_endpoints.dart';
import 'package:patreon_clone/backend/common/api_service.dart';

class MyCreatorPageRepository {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>?> publishCreator({
    required String token,
    required bool acceptTerms,
  }) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.usersPublishCreator,
        body: {'acceptTerms': acceptTerms},
      );

      MyPrint.printOnConsole("Creator published successfully: ${response.data}");

      if (response.success) {
        return response.data;
      } else {
        MyPrint.printOnConsole(
          'Failed to publish creator: ${response.statusCode} - ${response.errorMessage}',
        );
        return null;
      }
    } catch (e) {
      MyPrint.printOnConsole('Error publishing creator: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>?> completeStripeOnboarding({
    required String token,
  }) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.usersStripeOnboardingComplete,
      );

      MyPrint.printOnConsole(
        "Stripe onboarding completed successfully: ${response.data}",
      );

      if (response.success) {
        return response.data;
      } else {
        MyPrint.printOnConsole(
          'Failed to complete onboarding: ${response.statusCode} - ${response.errorMessage}',
        );
        return null;
      }
    } catch (e) {
      MyPrint.printOnConsole('Error completing onboarding: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>?> updateSocialLinks({
    required String token,
    required List<SocialLinkModel> socialLinks,
  }) async {
    try {
      final response = await _apiService.put(
        ApiEndpoints.usersSocialLinks,
        body: {
          'socialLinks': socialLinks.map((e) => e.toMap()).toList(),
        },
      );

      MyPrint.printOnConsole('Update social links response: ${response.data}');

      if (response.success) {
        return response.data;
      } else {
        MyPrint.printOnConsole(
          'Failed to update social links: ${response.statusCode} - ${response.errorMessage}',
        );
      }
    } catch (e) {
      MyPrint.printOnConsole('Error updating social links: $e');
    }

    return null;
  }

  Future<Map<String, dynamic>?> updateAbout({
    required String token,
    String? introVideoUrl,
    String? bio,
    required List<SocialLinkModel> socialLinks,
  }) async {
    try {
      final body = <String, dynamic>{
        if (introVideoUrl != null) 'introVideoUrl': introVideoUrl,
        if (bio != null) 'bio': bio,
        'socialLinks': socialLinks.map((e) => e.toMap()).toList(),
      };

      final response = await _apiService.put(ApiEndpoints.usersAbout, body: body);

      MyPrint.printOnConsole('Update about response: ${response.data}');

      if (response.success) {
        return response.data;
      } else {
        MyPrint.printOnConsole(
          'Failed to update about details: ${response.statusCode} - ${response.errorMessage}',
        );
      }
    } catch (e) {
      MyPrint.printOnConsole('Error updating about details: $e');
    }

    return null;
  }

  Future<Map<String, dynamic>?> getCreatorAbout({
    required String token,
    required String username,
  }) async {
    try {
      final response = await _apiService.get(ApiEndpoints.usersCreatorAbout(username));

      MyPrint.printOnConsole('Get creator about response: ${response.data}');

      if (response.success) {
        return response.data;
      } else {
        MyPrint.printOnConsole(
          'Failed to get about details: ${response.statusCode} - ${response.errorMessage}',
        );
      }
    } catch (e) {
      MyPrint.printOnConsole('Error fetching about details: $e');
    }

    return null;
  }
}
