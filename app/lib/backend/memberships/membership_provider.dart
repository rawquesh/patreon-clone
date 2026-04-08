import 'package:patreon-clone/backend/common/common_provider.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';

class MembershipProvider extends CommonProvider {
  MembershipProvider() {
    memberships = CommonProviderListParameter<MembershipModel>(list: [], notify: notify);
    isLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);
  }

  late CommonProviderListParameter<MembershipModel> memberships;
  late CommonProviderPrimitiveParameter<bool> isLoading;
}
