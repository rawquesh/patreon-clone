import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';
import 'report_user_reason.dart';

class UserReportRepository {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>> submitReport({
    required String userId,
    required ReportUserReason reason,
    required String description,
    String? additionalContext,
  }) async {
    try {
      final body = <String, dynamic>{
        'userId': userId,
        'reason': reason.apiValue,
        'description': description,
        if (additionalContext != null && additionalContext.isNotEmpty) 'additionalContext': additionalContext,
      };

      MyPrint.printOnConsole('Reporting user with body: $body');

      final response = await _apiService.post(ApiEndpoints.reportsUsers, body: body);

      MyPrint.printOnConsole('Report response status: ${response.statusCode}');

      if (response.success) {
        return {
          'success': true,
          'data': response.data,
        };
      } else if (response.statusCode == 409) {
        return {
          'success': false,
          'message': 'You have already reported this user.',
        };
      } else if (response.statusCode == 403) {
        return {
          'success': false,
          'message': 'Cannot report your own account.',
        };
      } else {
        return {
          'success': false,
          'message': response.errorMessage ?? 'Failed to submit report. Please try again.',
        };
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error submitting report: $e');
      MyPrint.printOnConsole(s);
      return {
        'success': false,
        'message': 'An unexpected error occurred.',
      };
    }
  }
}
