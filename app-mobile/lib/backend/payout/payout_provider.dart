import 'package:patreon_clone/backend/common/common_provider.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/payout/payout_model.dart';

class PayoutProvider extends CommonProvider {
  PayoutProvider() {
    availableFunds = CommonProviderPrimitiveParameter<double>(value: 0.0, notify: notify);
    pendingFunds = CommonProviderPrimitiveParameter<double>(value: 0.0, notify: notify);
    payoutsPaginationModel = CommonProviderPrimitiveParameter(
      value: APIDocumentsPaginatedListModel<PayoutModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
        initialPageIndex: 1,
      ),
      notify: notify,
    );
    isLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);
  }

  late CommonProviderPrimitiveParameter<double> availableFunds;
  late CommonProviderPrimitiveParameter<double> pendingFunds;
  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<PayoutModel>> payoutsPaginationModel;
  late CommonProviderPrimitiveParameter<bool> isLoading;
}
