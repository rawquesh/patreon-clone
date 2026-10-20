import 'package:patreon_clone/backend/common/common_provider.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/post/data_model/comment_model.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';

class PostProvider extends CommonProvider {
  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<PostModel>> myCreatorPagePostsListPaginationModel;

  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<PostModel>> libraryPostsListPaginationModel;

  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<PostModel>> draftsListPaginationModel;

  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<CommentModel>> commentListPaginationModel;
  late CommonProviderMapParameter<String, APIDocumentsPaginatedListModel<CommentModel>> commentsPaginationMap;

  PostProvider() {
    myCreatorPagePostsListPaginationModel = CommonProviderPrimitiveParameter(
      value: APIDocumentsPaginatedListModel<PostModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );

    libraryPostsListPaginationModel = CommonProviderPrimitiveParameter(
      value: APIDocumentsPaginatedListModel<PostModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );

    draftsListPaginationModel = CommonProviderPrimitiveParameter(
      value: APIDocumentsPaginatedListModel<PostModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );

    commentListPaginationModel = CommonProviderPrimitiveParameter(
      value: APIDocumentsPaginatedListModel<CommentModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );

    commentsPaginationMap = CommonProviderMapParameter<String, APIDocumentsPaginatedListModel<CommentModel>>(
      map: {},
      notify: notify,
    );
  }
}
