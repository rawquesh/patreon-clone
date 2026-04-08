import 'package:patreon-clone/backend/common/common_provider.dart';
import 'package:patreon-clone/models/promotions/gift/gift_model.dart';

class GiftProvider extends CommonProvider {
  GiftProvider() {
    gifts = CommonProviderListParameter<GiftModel>(list: [], notify: notify);
    isLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);
  }

  late CommonProviderListParameter<GiftModel> gifts;
  late CommonProviderPrimitiveParameter<bool> isLoading;
}
