import 'package:patreon-clone/helpers/parsing_helper.dart';

class LikeModel {
  String id;
  String userId;
  DateTime createdAt;

  LikeModel({
    required this.id,
    required this.userId,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory LikeModel.fromMap(Map<String, dynamic> map) {
    return LikeModel(
      id: ParsingHelper.parseStringMethod(map["_id"]),
      userId: ParsingHelper.parseStringMethod(map["user"]),
      createdAt: ParsingHelper.parseDateTimeMethod(map["createdAt"]),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      "_id": id,
      "user": userId,
      "createdAt": createdAt.toIso8601String(),
    };
  }
}
