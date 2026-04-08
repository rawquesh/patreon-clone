import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

class ChatModel {
  String id = "";
  String type = "";
  String title = "";
  String description = "";
  String creator = "";
  List<String> participants = [];
  String accessType = "";
  bool isDeleted = false;
  String lastMessage = "";

  ChatModel({
    this.id = "",
    this.type = "",
    this.title = "",
    this.description = "",
    this.creator = "",
    this.participants = const [],
    this.accessType = "",
    this.isDeleted = false,
    this.lastMessage = "",
  });

  factory ChatModel.fromMap(Map<String, dynamic> map) {
    return ChatModel().updateFromMap(map);
  }

  ChatModel updateFromMap(Map<String, dynamic> map) {
    id = map["id"] != null ? ParsingHelper.parseStringMethod(map["id"]) : id;
    type = map["type"] != null ? ParsingHelper.parseStringMethod(map["type"]) : type;
    title = map["title"] != null ? ParsingHelper.parseStringMethod(map["title"]) : title;
    description = map["description"] != null ? ParsingHelper.parseStringMethod(map["description"]) : description;
    creator = map["creator"] != null ? ParsingHelper.parseStringMethod(map["creator"]) : creator;
    participants = map["participants"] != null
        ? ParsingHelper.parseListMethod<dynamic, String>(map["participants"])
        : participants;
    accessType = map["accessType"] != null
        ? ParsingHelper.parseStringMethod(map["accessType"])
        : accessType;
    isDeleted = map["isDeleted"] != null
        ? ParsingHelper.parseBoolMethod(map["isDeleted"])
        : isDeleted;
    lastMessage = map["lastMessage"] != null
        ? ParsingHelper.parseStringMethod(map["lastMessage"])
        : lastMessage;
    return this;
  }

  Map<String, dynamic> toMap() {
    return {
      "id": id,
      "type": type,
      "title": title,
      "description": description,
      "creator": creator,
      "participants": participants,
      "accessType": accessType,
      "isDeleted": isDeleted,
      "lastMessage": lastMessage,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
