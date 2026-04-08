import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

class NotificationPostModel {
  String id;
  String title;
  String thumbnailUrl;

  NotificationPostModel({this.id = '', this.title = '', this.thumbnailUrl = ''});

  factory NotificationPostModel.fromMap(Map<String, dynamic> map) {
    return NotificationPostModel().updateFromMap(map);
  }

  NotificationPostModel updateFromMap(Map<String, dynamic> map) {
    id = map['id'] != null ? ParsingHelper.parseStringMethod(map['id']) : id;
    title = map['title'] != null ? ParsingHelper.parseStringMethod(map['title']) : title;
    thumbnailUrl = map['thumbnailUrl'] != null ? ParsingHelper.parseStringMethod(map['thumbnailUrl']) : thumbnailUrl;
    return this;
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'thumbnailUrl': thumbnailUrl,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
