import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

class CreateImagesPostRequestModel {
  String title = "";
  String description = "";
  List<String> tags = [];
  List<String> collections = [];
  bool isDraft = false;
  List<String> tierAccess = [];
  List<String> existingAttachments = [];
  List<String> existingImages = [];

  CreateImagesPostRequestModel({
    this.title = "",
    this.description = "",
    this.tags = const [],
    this.collections = const [],
    this.isDraft = false,
    this.tierAccess = const [],
    this.existingAttachments = const [],
    this.existingImages = const [],
  });

  factory CreateImagesPostRequestModel.fromMap(Map<String, dynamic> map) {
    return CreateImagesPostRequestModel().updateFromMap(map);
  }

  CreateImagesPostRequestModel updateFromMap(Map<String, dynamic> map) {
    title = map["title"] != null
        ? ParsingHelper.parseStringMethod(map["title"])
        : title;

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

    existingImages = map["existingImages"] != null
        ? ParsingHelper.parseListMethod<dynamic, String>(map["existingImages"])
        : existingImages;

    isDraft = map["isDraft"] != null
        ? ParsingHelper.parseBoolMethod(map["isDraft"])
        : isDraft;

    return this;
  }

  Map<String, dynamic> toMap() {
    return {
      "title": title,
      "description": description,
      "tags": tags,
      "collections": collections,
      "tierAccess": tierAccess,
      "existingAttachments": existingAttachments,
      "existingImages": existingImages,
      "isDraft": isDraft,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
