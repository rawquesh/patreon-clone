import 'package:patreon-clone/utils/my_print.dart';

import 'package:patreon-clone/pages/creator/insights/membership_analytics_model.dart';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';

class MembershipAnalyticsRepository {
  final ApiService _apiService = ApiService();

  Future<MembershipAnalyticsModel?> getAnalytics({String timeRange = '7d'}) async {
    try {
      final response = await _apiService.get(
        ApiEndpoints.analyticsMemberships,
        queryParams: {'timeRange': timeRange},
      );

      MyPrint.printOnConsole('Membership Analytics Response: ${response.statusCode}');

      if (response.success && response.data != null) {
        return MembershipAnalyticsModel.fromMap(response.data!);
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error fetching membership analytics: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }
}
