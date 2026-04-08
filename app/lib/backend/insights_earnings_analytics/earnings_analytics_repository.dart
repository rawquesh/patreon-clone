import 'dart:developer';

import 'package:patreon-clone/utils/my_print.dart';

import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';
import 'earnings_analytics_model.dart';

class EarningsAnalyticsRepository {
  final ApiService _apiService = ApiService();

  Future<EarningsAnalyticsModel?> getAnalytics({String timeRange = '7d'}) async {
    try {
      final response = await _apiService.get(
        ApiEndpoints.analyticsEarnings,
        queryParams: {'timeRange': timeRange, 'filter': 'membership'},
      );

      MyPrint.printOnConsole('Earnings Analytics Response: ${response.statusCode}');
      log('Body: ${response.data}');

      if (response.success && response.data != null) {
        return EarningsAnalyticsModel.fromMap(response.data!);
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error fetching earnings analytics: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }
}
