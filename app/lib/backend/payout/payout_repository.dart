import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';

class PayoutRepository {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>?> getAvailableFunds() async {
    final response = await _apiService.get(ApiEndpoints.paymentsAvailable);

    if (response.success) {
      return response.data;
    }
    MyPrint.printOnConsole('Error fetching available funds: ${response.errorMessage}');
    return null;
  }

  Future<Map<String, dynamic>?> initiatePayout() async {
    final response = await _apiService.post(ApiEndpoints.paymentsTransfer);

    if (response.success) {
      return response.data;
    } else {
      MyPrint.printOnConsole('Error initiating payout: ${response.errorMessage}');
      return {'error': response.errorMessage};
    }
  }
}
