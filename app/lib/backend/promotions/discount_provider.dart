import 'package:patreon-clone/backend/common/common_provider.dart';
import 'package:patreon-clone/models/promotions/discount/discount_model.dart';

class DiscountProvider extends CommonProvider {
  DiscountProvider() {
    discounts = CommonProviderListParameter<DiscountModel>(list: [], notify: notify);
    isLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);
  }

  late CommonProviderListParameter<DiscountModel> discounts;
  late CommonProviderPrimitiveParameter<bool> isLoading;
}
