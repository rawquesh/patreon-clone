import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

class CreateTextPostRequestModel {
  String title = "";
  String textContent = "";
  List<String> tags = [];
  List<String> collections = [];
  bool isDraft = false;
  List<String> tierAccess = [];
  List<String> existingAttachments = [];

  CreateTextPostRequestModel({
    this.title = "",
    this.textContent = "",
    this.tags = const [],
    this.collections = const [],
    this.isDraft = false,
    this.tierAccess = const [],
    this.existingAttachments = const [],
  });

  factory CreateTextPostRequestModel.fromMap(Map<String, dynamic> map) {
    return CreateTextPostRequestModel().updateFromMap(map);
  }

  CreateTextPostRequestModel updateFromMap(Map<String, dynamic> map) {
    title = map["title"] != null
        ? ParsingHelper.parseStringMethod(map["title"])
        : title;

    textContent = map["textContent"] != null
        ? ParsingHelper.parseStringMethod(map["textContent"])
        : textContent;

    tags = map["tags"] != null
        ? ParsingHelper.parseListMethod<dynamic, String>(map["tags"])
        : tags;

    collections = map["collections"] != null
        ? ParsingHelper.parseListMethod<dynamic, String>(map["collections"])
        : collections;

    tierAccess = map["tierAccess"] != null
        ? ParsingHelper.parseListMethod<dynamic, String>(map["tierAccess"])
        : tierAccess;

    existingAttachments = map["existingAttachments"] != null
        ? ParsingHelper.parseListMethod<dynamic, String>(map["existingAttachments"])
        : existingAttachments;

    isDraft = map["isDraft"] != null
        ? ParsingHelper.parseBoolMethod(map["isDraft"])
        : isDraft;

    return this;
  }

  Map<String, dynamic> toMap() {
    return {
      "title": title,
      "textContent": textContent,
      "tags": tags,
      "collections": collections,
      "tierAccess": tierAccess,
      "existingAttachments": existingAttachments,
      "isDraft": isDraft,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
