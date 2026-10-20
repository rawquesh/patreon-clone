import 'dart:developer';

import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/backend/common/api_endpoints.dart';
import 'package:patreon_clone/backend/common/api_service.dart';
import 'package:patreon_clone/backend/common/api_response.dart';

class PostRepository {
  final ApiService _apiService = ApiService();

  Future<Result<Map<String, dynamic>>> createCommentOnPost({
    required String postId,
    required String text,
    String? parentId,
  }) async {
    final Map<String, dynamic> requestBody = {
      'text': text,
      if (parentId != null) 'parentId': parentId,
    };

    final response = await _apiService.post(
      ApiEndpoints.postComments(postId),
      body: requestBody,
    );

    if (response.success) {
      MyPrint.printOnConsole("✅ Comment Created: ${response.data}");
      return Result.ok(response.data ?? {});
    } else {
      MyPrint.printOnConsole("❌ Failed to create comment: ${response.statusCode} - ${response.errorMessage}");
      return Result.fromFailure(response);
    }
  }

  Future<PostModel?> getPostById({required String postId}) async {
    MyPrint.printOnConsole('📥 Fetching post: ${ApiEndpoints.post(postId)}');

    final response = await _apiService.get(ApiEndpoints.post(postId));

    MyPrint.printOnConsole('📤 Response status: ${response.statusCode}');

    if (response.success && response.data != null) {
      log('✅ Post data: ${response.data}');
      return PostModel.fromMap(response.data!);
    } else if (response.statusCode == 404) {
      MyPrint.printOnConsole("❌ Post not found (404)");
      return null;
    } else {
      MyPrint.printOnConsole("❌ Failed to fetch post: ${response.statusCode} - ${response.errorMessage}");
      return null;
    }
  }
}
