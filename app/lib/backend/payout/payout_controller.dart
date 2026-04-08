import 'package:flutter/cupertino.dart';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';
import 'package:patreon-clone/models/common/data_model/paginated_request_model.dart';
import 'package:patreon-clone/models/payout/payout_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/backend/payout/payout_provider.dart';
import 'package:patreon-clone/backend/payout/payout_repository.dart';

class PayoutController {
  final PayoutProvider provider;
  final PayoutRepository _repository;
  final ApiService _apiService = ApiService();

  PayoutController({required this.provider, PayoutRepository? repository}) : _repository = repository ?? PayoutRepository();

  Future<void> fetchAvailableFunds({bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final result = await _repository.getAvailableFunds();
    if (result != null) {
      provider.availableFunds.set(value: double.tryParse(result['available'].toString()) ?? 0.0, isNotify: false);
      provider.pendingFunds.set(value: double.tryParse(result['pending'].toString()) ?? 0.0, isNotify: false);
      provider.notify(isNotify: isNotify);
    }
    provider.isLoading.set(value: false, isNotify: isNotify);
  }

  Future<void> getPayoutHistory({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    await _apiService.getPaginatedList(PaginatedRequestModel<PayoutModel>(
      paginatedListModel: provider.payoutsPaginationModel.get(),
      endpoint: ApiEndpoints.paymentsHistory,
      dataListKey: 'payouts',
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
      fromMap: (data) => PayoutModel.fromMap(data),
    ));

    final payouts = provider.payoutsPaginationModel.get().contentsList.getList();
    MyPrint.printOnConsole('[getPayoutHistory] Loaded payouts count: ${payouts.length}');
    for (var p in payouts) {
      MyPrint.printOnConsole('[getPayoutHistory] Payout: ${p.toMap()}');
    }
  }

  Future<void> initiatePayout(BuildContext context, {bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final result = await _repository.initiatePayout();
    provider.isLoading.set(value: false, isNotify: isNotify);
    if (result != null && result['success'] == true) {
      MyToast.showSuccess(context: context, msg: result['message'] ?? 'Payout initiated');
      await fetchAvailableFunds(isNotify: false);
      await getPayoutHistory(isRefresh: true, isFromCache: false, isNotify: false);
    } else {
      final message = result?['message'] ?? result?['error'] ?? 'No funds available for payout';
      MyToast.showError(context: context, msg: message.toString());
    }
  }
}
