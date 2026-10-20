import 'package:patreon_clone/backend/common/api_endpoints.dart';
import 'package:patreon_clone/backend/common/api_service.dart';
import 'package:patreon_clone/models/common/data_model/paginated_request_model.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/backend/post/post_provider.dart';

class LibraryController {
  final PostProvider postProvider;
  final ApiService _apiService = ApiService();

  LibraryController({required this.postProvider});

  Future<void> getLibraryPostsPaginatedList({
    bool isRefresh = false,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    final paginatedListModel = postProvider.libraryPostsListPaginationModel.get();

    await _apiService.getPaginatedList(PaginatedRequestModel<PostModel>(
      paginatedListModel: paginatedListModel,
      endpoint: ApiEndpoints.postsMyPosts,
      dataListKey: 'posts',
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
      pageLimit: paginatedListModel.contentsDocumentLimitForPagination.get(),
      fromMap: (data) {
        MyPrint.printOnConsole("Raw post data: $data");
        try {
          final normalized = Map<String, dynamic>.from(data);
          if (data.containsKey('id')) {
            normalized['_id'] = data['id'];
          }
          if (data.containsKey('thumbnail')) {
            normalized['thumbnailUrl'] = data['thumbnail'];
          }
          if (!data.containsKey('type') && data.containsKey('postType')) {
            normalized['type'] = data['postType'];
          }
          return PostModel.fromMap(normalized);
        } catch (e) {
          MyPrint.printOnConsole("Error parsing post: $e");
          return null;
        }
      },
    ));
  }

  Future<void> getDraftsPaginatedList({
    bool isRefresh = false,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    final paginatedListModel = postProvider.draftsListPaginationModel.get();

    await _apiService.getPaginatedList(PaginatedRequestModel<PostModel>(
      paginatedListModel: paginatedListModel,
      endpoint: ApiEndpoints.postsDrafts,
      dataListKey: 'drafts',
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
      pageLimit: paginatedListModel.contentsDocumentLimitForPagination.get(),
      fromMap: (data) {
        try {
          final normalized = Map<String, dynamic>.from(data);
          if (data.containsKey('id')) {
            normalized['_id'] = data['id'];
          }
          if (data.containsKey('thumbnail')) {
            normalized['thumbnailUrl'] = data['thumbnail'];
          }
          if (!data.containsKey('type') && data.containsKey('postType')) {
            normalized['type'] = data['postType'];
          }
          return PostModel.fromMap(normalized);
        } catch (e) {
          MyPrint.printOnConsole("Error parsing draft post: $e");
          return null;
        }
      },
    ));
  }
}
