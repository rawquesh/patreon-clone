import 'package:patreon_clone/models/post/data_model/like_model.dart';

import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';

class CommentModel {
  String id = "";
  String userId = "";
  String text = "";
  bool isLiked = false;
  DateTime createdAt = DateTime.now();
  Map<String, LikeModel> likes = {};
  int likesCount = 0;
  String? parentCommentId;
  String displayName = "";
  String profilePicture = "";

  CommentModel({
    this.id = "",
    this.userId = "",
    this.text = "",
    this.isLiked = false,
    DateTime? createdAt,
    this.likesCount = 0,
    this.displayName = "",
    this.profilePicture = "",
    Map<String, LikeModel> likes = const {},
    this.parentCommentId,
  })  : likes = Map<String, LikeModel>.from(likes),
        createdAt = createdAt ?? DateTime.now();

  factory CommentModel.fromMap(Map<String, dynamic> map) {
    return CommentModel().updateFromMap(map);
  }

  CommentModel updateFromMap(Map<String, dynamic> map) {
    id = map["id"] != null ? ParsingHelper.parseStringMethod(map["id"]) : id;
    userId = map["userId"] != null ? ParsingHelper.parseStringMethod(map["UserId"]) : userId;
    text = map["text"] != null ? ParsingHelper.parseStringMethod(map["text"]) : text;
    likesCount = ParsingHelper.parseIntMethod(map["likesCount"]);

    isLiked = map["isLiked"] == true;

    if (map["user"] != null) {
      Map<String, dynamic> userMap = ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(map["user"]);
      userId = userMap["id"] != null ? ParsingHelper.parseStringMethod(userMap["id"]) : userId;
      displayName = userMap["displayName"] != null ? ParsingHelper.parseStringMethod(userMap["displayName"]) : displayName;
      profilePicture =
          userMap["profilePicture"] != null ? ParsingHelper.parseStringMethod(userMap["profilePicture"]) : profilePicture;
    }

    likes.clear();
    if (map['likes'] != null) {
      List<dynamic> likesList = ParsingHelper.parseListMethod<dynamic, dynamic>(map['likes']);
      for (var likeData in likesList) {
        final like = LikeModel.fromMap(ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(likeData));
        likes[like.id] = like;
      }
    }

    parentCommentId = map["parentId"] != null ? ParsingHelper.parseStringMethod(map["parentId"]) : parentCommentId;

    createdAt = map["createdAt"] != null ? ParsingHelper.parseDateTimeMethod(map["createdAt"]) ?? createdAt : createdAt;

    return this;
  }

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      "_id": id,
      "userId": userId,
      "text": text,
      "likes": likes.values.map((like) => like.toMap()).toList(),
      "likesCount": likesCount,
      "isLiked": isLiked,
      "parentComment": parentCommentId,
      "user": {
        "id": userId,
        "displayName": displayName,
        "profilePicture": profilePicture,
      },
      "createdAt": toJson ? createdAt.toIso8601String() : createdAt,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap(toJson: true));
}
