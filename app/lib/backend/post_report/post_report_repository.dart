import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';
import 'report_reason.dart';

class PostReportRepository {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>> submitReport({
    required String postId,
    required ReportReason reason,
    required String description,
    String? additionalContext,
  }) async {
    try {
      final body = <String, dynamic>{
        'postId': postId,
        'reason': reason.apiValue,
        'description': description,
        if (additionalContext != null && additionalContext.isNotEmpty) 'additionalContext': additionalContext,
      };

      MyPrint.printOnConsole('Reporting post with body: $body');

      final response = await _apiService.post(ApiEndpoints.reportsPosts, body: body);

      MyPrint.printOnConsole('Report response status: ${response.statusCode}');

      if (response.success) {
        return {
          'success': true,
          'data': response.data,
        };
      } else if (response.statusCode == 409) {
        return {
          'success': false,
          'message': 'You have already reported this post.',
        };
      } else if (response.statusCode == 403) {
        return {
          'success': false,
          'message': 'Cannot report your own content.',
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
