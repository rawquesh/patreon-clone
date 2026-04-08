import 'package:patreon-clone/backend/common/common_provider.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/models/collection/collection_data_model.dart';

class PostCreationProvider extends CommonProvider {
  PostCreationProvider() {
    memberships = CommonProviderListParameter<MembershipModel>(list: [], notify: notify);
    collections = CommonProviderListParameter<CollectionModel>(list: [], notify: notify);
    isLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);
  }

  late CommonProviderListParameter<MembershipModel> memberships;
  late CommonProviderListParameter<CollectionModel> collections;
  late CommonProviderPrimitiveParameter<bool> isLoading;
}
