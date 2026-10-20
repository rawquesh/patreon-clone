import 'package:patreon_clone/backend/common/common_provider.dart';
import 'package:patreon_clone/models/audience/member_model.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';

class AudienceProvider extends CommonProvider {
  AudienceProvider() {
    membersPaginationModel = CommonProviderPrimitiveParameter(
      value: APIDocumentsPaginatedListModel<MemberModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );
  }

  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<MemberModel>> membersPaginationModel;
}
