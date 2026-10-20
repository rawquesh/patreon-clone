import 'package:patreon_clone/models/post/data_model/post_model.dart';

import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';
import 'package:patreon_clone/models/creator/creator_model.dart';

class CollectionModel {
  String id = '';
  String title = '';
  String description = '';
  String coverImage = '';
  CreatorModel? creator;
  int postCount = 0;
  bool isActive = true;
  bool isDeleted = false;
  List<PostModel> posts = [];
  DateTime createdAt = DateTime.now();
  DateTime updatedAt = DateTime.now();

  CollectionModel({
    this.id = '',
    this.title = '',
    this.description = '',
    this.coverImage = '',
    this.creator,
    this.postCount = 0,
    this.isActive = true,
    this.isDeleted = false,
    this.posts = const [],
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory CollectionModel.fromMap(Map<String, dynamic> map) {
    return CollectionModel().updateFromMap(map);
  }

  CollectionModel updateFromMap(Map<String, dynamic> map) {
    id = map['_id'] != null ? ParsingHelper.parseStringMethod(map['_id']) : id;
    title = map['title'] != null ? ParsingHelper.parseStringMethod(map['title']) : title;
    description = map['description'] != null ? ParsingHelper.parseStringMethod(map['description']) : description;
    coverImage = map['coverImage'] != null ? ParsingHelper.parseStringMethod(map['coverImage']) : coverImage;
    if (map['creator'] != null && map['creator'] is Map<String, dynamic>) {
      creator = CreatorModel.fromPostCreatorMap(ParsingHelper.parseMapMethod(map['creator']));
    }
    postCount = map['postCount'] != null ? ParsingHelper.parseIntMethod(map['postCount']) : postCount;
    isActive = map['isActive'] != null ? ParsingHelper.parseBoolMethod(map['isActive']) : isActive;
    isDeleted = map['isDeleted'] != null ? ParsingHelper.parseBoolMethod(map['isDeleted']) : isDeleted;
    createdAt = map['createdAt'] != null ? ParsingHelper.parseDateTimeMethod(map['createdAt']) ?? createdAt : createdAt;
    updatedAt = map['updatedAt'] != null ? ParsingHelper.parseDateTimeMethod(map['updatedAt']) ?? updatedAt : updatedAt;
    if (map['posts'] != null && map['posts'] is List) {
      posts = (map['posts'] as List).whereType<Map<String, dynamic>>().map((postData) => PostModel.fromMap(postData)).toList();
    }
    return this;
  }

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      '_id': id,
      'title': title,
      'description': description,
      'coverImage': coverImage,
      'creator': creator?.toMap(),
      'postCount': postCount,
      'isActive': isActive,
      'isDeleted': isDeleted,
      'posts': posts.map((post) => post.toMap(toJson: toJson)).toList(),
      'createdAt': toJson ? createdAt.toIso8601String() : createdAt,
      'updatedAt': toJson ? updatedAt.toIso8601String() : updatedAt,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap(toJson: true));
}
