import 'package:patreon-clone/backend/common/common_provider.dart';
import 'package:patreon-clone/models/collection/collection_data_model.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';

class CollectionProvider extends CommonProvider {
  CollectionProvider() {
    collections = CommonProviderListParameter<CollectionModel>(list: [], notify: notify);
    memberships = CommonProviderListParameter<MembershipModel>(list: [], notify: notify);
    isLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);
    selectedCollection = CommonProviderPrimitiveParameter<CollectionModel?>(value: null, notify: notify); // Add this line
    myCollectionsPaginationModel = CommonProviderPrimitiveParameter(
      value: APIDocumentsPaginatedListModel<CollectionModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );
  }

  late CommonProviderListParameter<CollectionModel> collections;
  late CommonProviderListParameter<MembershipModel> memberships;
  late CommonProviderPrimitiveParameter<bool> isLoading;
  late CommonProviderPrimitiveParameter<CollectionModel?> selectedCollection; // Add this line
  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<CollectionModel>> myCollectionsPaginationModel;
}
