import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';
import 'notification_comment_model.dart';
import 'notification_post_model.dart';

class NotificationModel {
  String id;
  String recipient;
  ActorModel actor;
  String type;
  bool isRead;
  DateTime? readAt;
  DateTime createdAt;
  DateTime updatedAt;
  Map<String, dynamic> metadata;
  String link;
  NotificationCommentModel? comment;
  NotificationPostModel? post;

  NotificationModel({
    this.id = '',
    this.recipient = '',
    ActorModel? actor,
    this.type = '',
    this.isRead = false,
    this.readAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
    this.link = '',
    this.comment,
    this.post,
  })  : actor = actor ?? ActorModel(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now(),
        metadata = metadata ?? {};

  factory NotificationModel.fromMap(Map<String, dynamic> map) {
    return NotificationModel().updateFromMap(map);
  }

  NotificationModel updateFromMap(Map<String, dynamic> map) {
    id = map['_id'] != null ? ParsingHelper.parseStringMethod(map['_id']) : id;

    if (map['recipient'] != null) {
      if (map['recipient'] is Map && map['recipient']['\$oid'] != null) {
        recipient = ParsingHelper.parseStringMethod(map['recipient']['\$oid']);
      } else {
        recipient = ParsingHelper.parseStringMethod(map['recipient']);
      }
    }

    // Updated actor parsing
    if (map['actor'] is Map) {
      actor = ActorModel.fromMap(map['actor']);
    }

    type = map['type'] != null ? ParsingHelper.parseStringMethod(map['type']) : type;
    isRead = map['isRead'] != null ? ParsingHelper.parseBoolMethod(map['isRead']) : isRead;
    readAt = ParsingHelper.parseDateTimeMethod(map['readAt']) ?? readAt;
    createdAt = ParsingHelper.parseDateTimeMethod(map['createdAt']) ?? createdAt;
    updatedAt = ParsingHelper.parseDateTimeMethod(map['updatedAt']) ?? updatedAt;
    metadata =
        ParsingHelper.parseMapMethod<String, dynamic, String, dynamic>(map['metadata']);
    link = map['link'] != null ? ParsingHelper.parseStringMethod(map['link']) : link;

    if (map['comment'] != null) {
      Map<String, dynamic> commentMap = ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(map['comment']);
      if (commentMap.isNotEmpty) {
        comment = NotificationCommentModel.fromMap(commentMap);
      }
    }

    if (map['post'] != null) {
      Map<String, dynamic> postMap = ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(map['post']);
      if (postMap.isNotEmpty) {
        post = NotificationPostModel.fromMap(postMap);
      }
    }

    return this;
  }

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      '_id': id,
      'recipient': recipient,
      'actor': actor.toMap(), // Use toMap() for the actor model
      'type': type,
      'comment': comment?.toMap(),
      'post': post?.toMap(),
      'metadata': metadata,
      'link': link,
      'isRead': isRead,
      'readAt': toJson ? readAt?.toIso8601String() : readAt,
      'createdAt': toJson ? createdAt.toIso8601String() : createdAt,
      'updatedAt': toJson ? updatedAt.toIso8601String() : updatedAt,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap(toJson: true));
}

class ActorModel {
  String id;
  String name;
  String profilePicture;

  ActorModel({this.id = '', this.name = '', this.profilePicture = ''});

  factory ActorModel.fromMap(Map<String, dynamic> map) {
    return ActorModel(id: map['id'] as String? ?? '', name: map['name'] as String? ?? '', profilePicture: map['profilePicture'] as String? ?? '');
  }

  Map<String, dynamic> toMap() {
    return {'id': id, 'name': name, 'profilePicture': profilePicture};
  }
}
