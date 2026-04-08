import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/utils/my_print.dart';

import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';
import 'package:patreon-clone/models/creator/creator_model.dart';
import 'package:patreon-clone/models/message/attachment_data_model.dart';
import 'comment_model.dart';
import 'like_model.dart';

class PostModel {
  String id = "";
  String type = "";
  String creatorId = "";
  CreatorModel? creator;
  String title = "";
  String description = "";
  String textContent = "";
  List<String> mediaUrls = [];
  String thumbnailUrl = "";
  String videoUrl = "";
  String videoId = "";
  String videoProvider = "";
  String linkUrl = "";
  String postType = "";
  List<String> collections = [];
  List<String> tags = [];
  String publishDate = "";
  String status = "";
  bool isDeleted = false;
  bool isActive = true;
  bool isDraft = false;
  bool hasLiked = false;
  bool isRestrictedView = false;
  bool hasAccess = true;
  int viewCount = 0;
  int likeCount = 0;
  int commentCount = 0;
  int shareCount = 0;
  CommentModel? lastComment;
  List<LikeModel> likes = [];
  Map<String, CommentModel> comments = <String, CommentModel>{};
  List<AttachmentModel> attachments = []; // Changed from List<String>
  List<String> existingAttachments = [];
  List<String> tierAccess = [];
  List<MembershipModel> requiredTiers = [];
  DateTime createdAt = DateTime.now();
  DateTime updatedAt = DateTime.now();

  PostModel({
    this.id = "",
    this.type = "",
    this.creatorId = "",
    this.creator,
    this.title = "",
    this.description = "",
    this.textContent = "",
    this.mediaUrls = const [],
    this.thumbnailUrl = "",
    this.videoUrl = "",
    this.videoId = "",
    this.videoProvider = "",
    this.publishDate = "",
    this.linkUrl = "",
    this.postType = "",
    this.collections = const [],
    this.tags = const [],
    this.status = "",
    this.isDeleted = false,
    this.isActive = true,
    this.hasLiked = true,
    this.isDraft = false,
    this.isRestrictedView = false,
    this.hasAccess = true,
    this.viewCount = 0,
    this.likeCount = 0,
    this.commentCount = 0,
    this.shareCount = 0,
    this.likes = const [],
    this.lastComment,
    Map<String, CommentModel> comments = const {},
    this.attachments = const [], // Changed this
    this.existingAttachments = const [],
    this.tierAccess = const [],
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : comments = Map<String, CommentModel>.from(comments),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory PostModel.fromMap(Map<String, dynamic> map) {
    return PostModel().updateFromMap(map);
  }

  PostModel updateFromMap(Map<String, dynamic> map) {
    id = map["_id"] != null ? ParsingHelper.parseStringMethod(map["_id"]) : id;
    type = map["type"] != null ? ParsingHelper.parseStringMethod(map["type"]) : type;
    creatorId = map["creator"] != null ? ParsingHelper.parseStringMethod(map["creator"]) : creatorId;
    if (map["creator"] != null && map["creator"] is Map<String, dynamic>) {
      creator = CreatorModel.fromPostCreatorMap(map["creator"] as Map<String, dynamic>);
    } else {
      creator = creator; // Keep existing or null
    }
    title = map["title"] != null ? ParsingHelper.parseStringMethod(map["title"]) : title;
    isRestrictedView =
        map["isRestrictedView"] != null ? ParsingHelper.parseBoolMethod(map["isRestrictedView"]) : isRestrictedView;
    hasAccess = map["hasAccess"] != null ? ParsingHelper.parseBoolMethod(map["hasAccess"]) : hasAccess;
    description = map["description"] != null ? ParsingHelper.parseStringMethod(map["description"]) : description;
    textContent = map["textContent"] != null ? ParsingHelper.parseStringMethod(map["textContent"]) : textContent;
    thumbnailUrl = map["thumbnailUrl"] != null ? ParsingHelper.parseStringMethod(map["thumbnailUrl"]) : thumbnailUrl;
    videoUrl = map["videoUrl"] != null ? ParsingHelper.parseStringMethod(map["videoUrl"]) : videoUrl;
    videoId = map["videoId"] != null ? ParsingHelper.parseStringMethod(map["videoId"]) : videoId;
    videoProvider = map["videoProvider"] != null ? ParsingHelper.parseStringMethod(map["videoProvider"]) : videoProvider;
    publishDate = map["publishDate"] != null ? ParsingHelper.parseStringMethod(map["publishDate"]) : publishDate;
    linkUrl = map["linkUrl"] != null ? ParsingHelper.parseStringMethod(map["linkUrl"]) : linkUrl;
    postType = map["postType"] != null ? ParsingHelper.parseStringMethod(map["postType"]) : postType;
    status = map["status"] != null ? ParsingHelper.parseStringMethod(map["status"]) : status;

    mediaUrls = map["mediaUrls"] != null ? ParsingHelper.parseListMethod<dynamic, String>(map["mediaUrls"]) : mediaUrls;
    collections = map["collections"] != null ? ParsingHelper.parseListMethod<dynamic, String>(map["collections"]) : collections;
    tags = map["tags"] != null ? ParsingHelper.parseListMethod<dynamic, String>(map["tags"]) : tags;

    // Updated parsing for attachments
    if (map["attachments"] != null && map["attachments"] is List) {
      attachments = (map["attachments"] as List).map((e) => AttachmentModel.fromMap(ParsingHelper.parseMapMethod(e))).toList();
    } else {
      attachments = attachments;
    }

    existingAttachments = map["existingAttachments"] != null
        ? ParsingHelper.parseListMethod<dynamic, String>(map["existingAttachments"])
        : existingAttachments;
    if (map["tierAccess"] != null) {
      List<dynamic> tiers = ParsingHelper.parseListMethod<dynamic, dynamic>(map["tierAccess"]);
      tierAccess = <String>[];
      for (var tier in tiers) {
        if (tier is Map) {
          String id = "";
          if (tier["_id"] != null) {
            id = ParsingHelper.parseStringMethod(tier["_id"]);
          } else if (tier["id"] != null) {
            id = ParsingHelper.parseStringMethod(tier["id"]);
          }
          if (id.isNotEmpty) tierAccess.add(id);
        } else {
          String id = ParsingHelper.parseStringMethod(tier);
          if (id.isNotEmpty) tierAccess.add(id);
        }
      }
    }

    if (map["tierAccess"] != null && map["tierAccess"] is List) {
      requiredTiers = (map["tierAccess"] as List).map((e) => MembershipModel.fromMap(ParsingHelper.parseMapMethod(e))).toList();
    }

    isDeleted = map["isDeleted"] != null ? ParsingHelper.parseBoolMethod(map["isDeleted"]) : isDeleted;
    isActive = map["isActive"] != null ? ParsingHelper.parseBoolMethod(map["isActive"]) : isActive;
    isDraft = map["isDraft"] != null ? ParsingHelper.parseBoolMethod(map["isDraft"]) : isDraft;

    viewCount = map["viewCount"] != null ? ParsingHelper.parseIntMethod(map["viewCount"]) : viewCount;
    hasLiked = map["hasLiked"] != null ? ParsingHelper.parseBoolMethod(map["hasLiked"]) : hasLiked;
    likeCount = map["likeCount"] != null ? ParsingHelper.parseIntMethod(map["likeCount"]) : likeCount;
    commentCount = map["commentCount"] != null ? ParsingHelper.parseIntMethod(map["commentCount"]) : commentCount;
    shareCount = map["shareCount"] != null ? ParsingHelper.parseIntMethod(map["shareCount"]) : shareCount;

    likes = map["likes"] != null ? ParsingHelper.parseListMethod<dynamic, LikeModel>(map["likes"]) : likes;

    comments = {};
    if (map['comments'] != null) {
      List<dynamic> commentsList = ParsingHelper.parseListMethod<dynamic, dynamic>(map['comments']);
      for (var commentData in commentsList) {
        final comment = CommentModel.fromMap(ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(commentData));
        comments[comment.id] = comment;
      }
    }

    if (map.containsKey("lastComment")) {
      Map<String, dynamic> lastCommentMap = ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(map['lastComment']);
      if (lastCommentMap.isNotEmpty) {
        lastComment = CommentModel.fromMap(lastCommentMap);
      } else {
        lastComment = null;
      }
    }

    MyPrint.printOnConsole("Parsed comments:");
    for (var c in comments.values) {
      MyPrint.printOnConsole("ID: ${c.id}, Parent: ${c.parentCommentId ?? 'null'}, Text: ${c.text}");
    }

    createdAt = map["createdAt"] != null ? ParsingHelper.parseDateTimeMethod(map["createdAt"]) ?? createdAt : createdAt;
    updatedAt = map["updatedAt"] != null ? ParsingHelper.parseDateTimeMethod(map["updatedAt"]) ?? updatedAt : updatedAt;

    return this;
  }

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      "_id": id,
      "type": type,
      // "creator": creatorId,
      "creator": creator?.toMap(),
      "title": title,
      "description": description,
      "textContent": textContent,
      "mediaUrls": mediaUrls,
      "thumbnailUrl": thumbnailUrl,
      "videoUrl": videoUrl,
      "videoId": videoId,
      "videoProvider": videoProvider,
      "publishDate": publishDate,
      "linkUrl": linkUrl,
      "postType": postType,
      "collections": collections,
      "tags": tags,
      // Attachments are handled via multipart, not in the JSON body for creation/update
      "attachments": attachments.map((attachment) => attachment.toMap()).toList(),
      "existingAttachments": existingAttachments,
      "tierAccess": tierAccess,
      "status": status,
      "isDeleted": isDeleted,
      "hasLiked": hasLiked,
      "isActive": isActive,
      "isDraft": isDraft,
      "viewCount": viewCount,
      "likeCount": likeCount,
      "commentCount": commentCount,
      "lastComment": lastComment?.toMap(toJson: toJson),
      "shareCount": shareCount,
      "likes": likes.map((like) => like.toMap()).toList(),
      "comments": comments.values.map((c) => c.toMap(toJson: toJson)).toList(),
      "createdAt": toJson ? createdAt.toIso8601String() : createdAt,
      "updatedAt": toJson ? updatedAt.toIso8601String() : updatedAt,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap(toJson: true));
}
