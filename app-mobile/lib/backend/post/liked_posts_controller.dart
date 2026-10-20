import 'dart:async';

import 'package:hive/hive.dart';
import 'package:patreon_clone/managers/hive_manager.dart';
import 'package:patreon_clone/utils/my_print.dart';

import 'my_post_controller.dart';
import 'liked_posts_provider.dart';

class LikedPostsController {
  static const String _boxName = 'liked_posts_box';
  static const String _likedMapKey = 'liked_posts_map';
  static const String _likedCommentsMapKey = 'liked_comments_map';

  final LikedPostsProvider likedPostsProvider;
  final MyPostController myPostController;

  LikedPostsController({required this.likedPostsProvider, required this.myPostController});

  Future<void> init() async {
    Box<Map>? box = await HiveManager().openBox<Map>(boxName: _boxName);
    Map postsMap = await HiveManager().get(key: _likedMapKey, defaultValue: {}, box: box) as Map;
    likedPostsProvider.likedPosts.setMap(map: Map<String, bool>.from(postsMap));
    Map commentsMap = await HiveManager().get(key: _likedCommentsMapKey, defaultValue: {}, box: box) as Map;
    likedPostsProvider.likedComments.setMap(map: Map<String, bool>.from(commentsMap));
  }

  bool isLiked(String postId) {
    return likedPostsProvider.likedPosts.getMap(isNewInstance: false)[postId] ?? false;
  }

  bool isCommentLiked(String commentId) {
    return likedPostsProvider.likedComments.getMap(isNewInstance: false)[commentId] ?? false;
  }

  Future<bool> getLikeStatus(String postId) async {
    if (likedPostsProvider.likedPosts.getMap(isNewInstance: false).containsKey(postId)) {
      return isLiked(postId);
    }

    try {
      bool liked = await myPostController.hasUserLikedPost(postId: postId);
      likedPostsProvider.likedPosts.setMap(map: {postId: liked}, isClear: false);
      await _save();
      return liked;
    } catch (e) {
      MyPrint.printOnConsole('Error fetching like status: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>> toggleLike(String postId) async {
    final result = await myPostController.toggleLikePost(postId: postId);
    if (result['success'] == true) {
      likedPostsProvider.likedPosts.setMap(
        map: {postId: result['liked'] ?? true},
        isClear: false,
      );
      await _save();
    }
    return result;
  }

  Future<Map<String, dynamic>> toggleCommentLike(String postId, String commentId) async {
    final result = await myPostController.toggleLikeComment(postId: postId, commentId: commentId);
    if (result['success'] == true) {
      likedPostsProvider.likedComments.setMap(
        map: {commentId: result['liked'] ?? true},
        isClear: false,
      );
      await _save();
    }
    return result;
  }

  void setLikeCount(String postId, int count) {
    likedPostsProvider.likeCounts.setMap(map: {postId: count}, isClear: false);
  }

  Future<void> _save() async {
    Box<Map>? box = await HiveManager().openBox<Map>(boxName: _boxName);
    await HiveManager().set(
      key: _likedMapKey,
      value: likedPostsProvider.likedPosts.getMap(isNewInstance: false),
      box: box,
    );
    await HiveManager().set(
      key: _likedCommentsMapKey,
      value: likedPostsProvider.likedComments.getMap(isNewInstance: false),
      box: box,
    );
  }
}
