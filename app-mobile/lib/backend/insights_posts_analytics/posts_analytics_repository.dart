import 'dart:developer';

import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/backend/insights_posts_analytics/post_analytics_model.dart';

import 'package:patreon_clone/backend/common/api_endpoints.dart';
import 'package:patreon_clone/backend/common/api_service.dart';

class PostsAnalyticsRepository {
  final ApiService _apiService = ApiService();

  Future<PostsAnalyticsModel?> getAnalytics({String timeRange = '7d'}) async {
    try {
      final response = await _apiService.get(
        ApiEndpoints.analyticsPosts,
        queryParams: {'timeRange': timeRange},
      );

      MyPrint.printOnConsole('Posts Analytics Response: ${response.statusCode}');
      log('Body: ${response.data}');

      if (response.success && response.data != null) {
        return PostsAnalyticsModel.fromMap(response.data!);
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error fetching posts analytics: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }
}
