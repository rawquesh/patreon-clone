import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';
import 'attachment_data_model.dart';

class MessageModel {
  String id = "";
  String chat = "";
  String sender = "";
  String content = "";
  bool isDeleted = false;
  DateTime createdAt = DateTime.now();
  DateTime updatedAt = DateTime.now();
  List<String> readBy = [];
  Map<String, AttachmentModel> attachments = {};

  MessageModel({
    this.id = "",
    this.chat = "",
    this.sender = "",
    this.content = "",
    this.isDeleted = false,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<String>? readBy,
    Map<String, AttachmentModel>? attachments,
  })  : readBy = readBy ?? [],
        attachments = attachments ?? {},
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory MessageModel.fromMap(Map<String, dynamic> map) {
    return MessageModel().updateFromMap(map);
  }

  MessageModel updateFromMap(Map<String, dynamic> map) {
    id = map["id"] != null ? ParsingHelper.parseStringMethod(map["id"]) : id;
    chat = map["chat"] != null ? ParsingHelper.parseStringMethod(map["chat"]) : chat;
    sender = map["sender"] != null ? ParsingHelper.parseStringMethod(map["sender"]) : sender;
    content = map["content"] != null ? ParsingHelper.parseStringMethod(map["content"]) : content;
    isDeleted = map["isDeleted"] != null
        ? ParsingHelper.parseBoolMethod(map["isDeleted"])
        : isDeleted;

    readBy = map["readBy"] != null
        ? ParsingHelper.parseListMethod<dynamic, String>(map["readBy"])
        : readBy;

    attachments = {};
    if (map['attachments'] != null) {
      Map<String, dynamic> attachmentMap = ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(map['attachments']);
      attachmentMap.forEach((key, value) {
        attachments[key] = AttachmentModel.fromMap(value);
      });
    }

    createdAt = map["createdAt"] != null
        ? ParsingHelper.parseDateTimeMethod(map["createdAt"]) ?? createdAt
        : createdAt;

    updatedAt = map["updatedAt"] != null
        ? ParsingHelper.parseDateTimeMethod(map["updatedAt"]) ?? updatedAt
        : updatedAt;

    return this;
  }

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      "id": id,
      "chat": chat,
      "sender": sender,
      "content": content,
      "isDeleted": isDeleted,
      "readBy": readBy,
      "attachments": attachments.values.map((attachment) => attachment.toMap()).toList(),
      "createdAt": toJson ? createdAt.toIso8601String() : createdAt,
      "updatedAt": toJson ? updatedAt.toIso8601String() : updatedAt,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap(toJson: true));
}
