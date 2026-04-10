import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';
import 'package:patreon-clone/backend/common/api_response.dart';
import 'package:patreon-clone/models/common/data_model/paginated_request_model.dart';
import 'package:patreon-clone/models/creator/creator_model.dart';
import 'package:patreon-clone/models/post/data_model/comment_model.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/backend/post/post_provider.dart';

class MyPostController {
  late PostProvider _postProvider;
  final ApiService _apiService = ApiService();

  MyPostController({
    required PostProvider? postProvider,
  }) {
    _postProvider = postProvider ?? PostProvider();
  }

  PostProvider get postProvider => _postProvider;

  Future<void> getMyCreatorPostsPaginatedList({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    await _apiService.getPaginatedList(PaginatedRequestModel<PostModel>(
      paginatedListModel: postProvider.myCreatorPagePostsListPaginationModel.get(),
      endpoint: ApiEndpoints.homeSubscribedFeed,
      dataListKey: 'posts',
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
      fromMap: (data) {
        final post = PostModel.fromMap(data);
        if (data['creator'] is Map<String, dynamic>) {
          final creatorData = data['creator'];
          post.creator = CreatorModel(
            id: creatorData['id'] ?? '',
            displayName: creatorData['displayName'] ?? '',
            profilePicture: creatorData['profilePicture'] ?? '',
            username: creatorData['username'] ?? '',
            category: creatorData['category'] ?? '',
          );
        }
        return post;
      },
    ));
  }

  Future<void> getPostCommentsPaginatedList({
    required String postId,
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    await _apiService.getPaginatedList(PaginatedRequestModel<CommentModel>(
      paginatedListModel: postProvider.commentListPaginationModel.get(),
      endpoint: ApiEndpoints.postComments(postId),
      dataListKey: 'comments',
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
      fromMap: (data) => CommentModel.fromMap(data),
    ));
  }

  // POST LIKE METHODS
  Future<bool> hasUserLikedPost({
    required String postId,
  }) async {
    try {
      final response = await _apiService.get(ApiEndpoints.postLiked(postId));

      MyPrint.printOnConsole("user Liked response: ${response.data}");
      if (response.success && response.data != null) {
        return response.data!['liked'] ?? false;
      }
      throw Exception('Failed to check post like status');
    } catch (e) {
      MyPrint.printOnConsole('Error checking post like status: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> toggleLikePost({
    required String postId,
  }) async {
    try {
      final hasLiked = await hasUserLikedPost(postId: postId);

      final response = hasLiked
          ? await _apiService.delete(ApiEndpoints.postLike(postId))
          : await _apiService.post(ApiEndpoints.postLike(postId));

      if (response.success && response.data != null) {
        return {
          'success': true,
          'liked': response.data!['liked'] ?? !hasLiked,
          'message': response.data!['message'] ?? (hasLiked ? 'Post unliked successfully' : 'Post liked successfully'),
        };
      } else {
        return {
          'success': false,
          'error': response.errorMessage ?? "Failed to ${hasLiked ? 'unlike' : 'like'} post",
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  Future<int> getCommentLikeCount({
    required String postId,
    required String commentId,
  }) async {
    final response = await _apiService.getOrThrow(
      ApiEndpoints.commentLikes(postId, commentId),
      queryParams: {
        'page': '1',
        'limit': '1', // Only need count
      },
    );

    return response['pagination']['total'] ?? 0;
  }

  Future<bool> hasUserLikedComment({
    required String postId,
    required String commentId,
  }) async {
    try {
      final response = await _apiService.get(ApiEndpoints.commentLiked(postId, commentId));

      MyPrint.printOnConsole("user liked Comment: ${response.data}");
      if (response.success && response.data != null) {
        return response.data!['liked'] ?? false;
      }
      throw Exception('Failed to check comment like status');
    } catch (e) {
      MyPrint.printOnConsole('Error checking comment like status: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> toggleLikeComment({
    required String postId,
    required String commentId,
  }) async {
    try {
      bool hasLiked = await hasUserLikedComment(
        postId: postId,
        commentId: commentId,
      );

      final response = hasLiked
          ? await _apiService.delete(ApiEndpoints.commentLike(postId, commentId))
          : await _apiService.post(ApiEndpoints.commentLike(postId, commentId));

      MyPrint.printOnConsole("comment liked by user: ${response.data}");
      if (response.success && response.data != null) {
        return {
          'success': true,
          'liked': response.data!['liked'] ?? !hasLiked,
          'message': response.data!['message'] ?? (hasLiked ? 'Comment unliked successfully' : 'Comment liked successfully'),
        };
      } else {
        throw Exception("Failed to ${hasLiked ? 'unlike' : 'like'} comment: ${response.errorMessage}");
      }
    } catch (e) {
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  Future<Result<void>> publishPost({required String postId}) async {
    try {
      final response = await _apiService.post(ApiEndpoints.postPublish(postId));

      MyPrint.printOnConsole('Publish post response: ${response.statusCode}');
      MyPrint.printOnConsole('${response.data}');

      if (response.success) {
        return Result.ok(null);
      }
      return Result.fromFailure(response);
    } catch (e) {
      MyPrint.printOnConsole('Error publishing post: $e');
      return Result.fail(e.toString());
    }
  }

  Future<Result<void>> unpublishPost({required String postId}) async {
    try {
      final response = await _apiService.post(ApiEndpoints.postUnpublish(postId));

      MyPrint.printOnConsole('Unpublish post response: ${response.statusCode}');
      MyPrint.printOnConsole('${response.data}');

      if (response.success) {
        return Result.ok(null);
      }
      return Result.fromFailure(response);
    } catch (e) {
      MyPrint.printOnConsole('Error unpublishing post: $e');
      return Result.fail(e.toString());
    }
  }

  Future<Result<void>> addPostToCollection({
    required String postId,
    required String collectionId,
  }) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.collectionPosts(collectionId),
        body: {'postId': postId},
      );

      MyPrint.printOnConsole('Add post to collection response: ${response.statusCode}');
      MyPrint.printOnConsole('${response.data}');

      if (response.success) {
        return Result.ok(null);
      }
      return Result.fromFailure(response);
    } catch (e) {
      MyPrint.printOnConsole('Error adding post to collection: $e');
      return Result.fail(e.toString());
    }
  }

  Future<Result<void>> deletePost({required String postId}) async {
    try {
      final response = await _apiService.delete(ApiEndpoints.post(postId));

      MyPrint.printOnConsole('Delete post response: ${response.statusCode}');
      MyPrint.printOnConsole('${response.data}');

      if (response.success) {
        return Result.ok(null);
      }
      return Result.fromFailure(response);
    } catch (e) {
      MyPrint.printOnConsole('Error deleting post: $e');
      return Result.fail(e.toString());
    }
  }

  Future<Result<void>> deletePostPermanently({required String postId}) async {
    try {
      final response = await _apiService.delete(ApiEndpoints.postPermanent(postId));

      MyPrint.printOnConsole('Permanent delete post response: ${response.statusCode}');
      MyPrint.printOnConsole('${response.data}');

      if (response.success) {
        return Result.ok(null);
      }
      return Result.fromFailure(response);
    } catch (e) {
      MyPrint.printOnConsole('Error permanently deleting post: $e');
      return Result.fail(e.toString());
    }
  }
}
