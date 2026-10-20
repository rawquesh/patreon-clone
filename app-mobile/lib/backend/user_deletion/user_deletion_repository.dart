import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/backend/common/api_endpoints.dart';
import 'package:patreon_clone/backend/common/api_service.dart';

class UserDeletionRepository {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>> deleteAccount({
    required String password,
    required String reason,
    required bool confirmDeletion,
  }) async {
    try {
      MyPrint.printOnConsole('Deleting user account');

      final response = await _apiService.delete(
        ApiEndpoints.usersAccount,
        body: {
          'password': password,
          'reason': reason,
          'confirmDeletion': confirmDeletion,
        },
      );

      MyPrint.printOnConsole('Delete account response status: ${response.statusCode}');

      if (response.success) {
        return {
          'success': true,
          'data': response.data,
        };
      } else {
        return {
          'success': false,
          'message': response.errorMessage ?? 'Failed to delete account. Please try again.',
          'statusCode': response.statusCode,
        };
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error deleting account: $e');
      MyPrint.printOnConsole(s);
      return {
        'success': false,
        'message': 'An unexpected error occurred.',
      };
    }
  }
}
