import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';

class CreateVideoPostRequestModel {
  String title = "";
  String videoUrl = "";
  String description = "";
  List<String> tags = [];
  List<String> collections = [];
  bool isDraft = false;
  List<String> tierAccess = [];
  List<String> existingAttachments = [];

  CreateVideoPostRequestModel({
    this.title = "",
    this.videoUrl = "",
    this.description = "",
    this.tags = const [],
    this.collections = const [],
    this.isDraft = false,
    this.tierAccess = const [],
    this.existingAttachments = const [],
  });

  factory CreateVideoPostRequestModel.fromMap(Map<String, dynamic> map) {
    return CreateVideoPostRequestModel().updateFromMap(map);
  }

  CreateVideoPostRequestModel updateFromMap(Map<String, dynamic> map) {
    title = map["title"] != null
        ? ParsingHelper.parseStringMethod(map["title"])
        : title;

    videoUrl = map["videoUrl"] != null
        ? ParsingHelper.parseStringMethod(map["videoUrl"])
        : videoUrl;

    description = map["description"] != null
        ? ParsingHelper.parseStringMethod(map["description"])
        : description;

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
      "videoUrl": videoUrl,
      "description": description,
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
