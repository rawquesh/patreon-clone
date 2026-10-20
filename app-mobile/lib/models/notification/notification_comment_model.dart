import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';

class NotificationCommentModel {
  String id;
  String content;

  NotificationCommentModel({
    this.id = '',
    this.content = '',
  });

  factory NotificationCommentModel.fromMap(Map<String, dynamic> map) {
    return NotificationCommentModel().updateFromMap(map);
  }

  NotificationCommentModel updateFromMap(Map<String, dynamic> map) {
    id = map['_id'] != null ? ParsingHelper.parseStringMethod(map['_id']) : id;
    content = map['content'] != null ? ParsingHelper.parseStringMethod(map['content']) : content;
    return this;
  }

  Map<String, dynamic> toMap() {
    return {
      '_id': id,
      'content': content,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}