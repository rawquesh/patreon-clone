import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';

class CreatorModel {
  String id = "";
  String bio = "";
  String displayName = "";
  String profilePicture = "";
  String profileCover = "";
  String username = "";
  String category = "";

  CreatorModel({
    this.id = "",
    this.bio = "",
    this.displayName = "",
    this.profilePicture = "",
    this.profileCover = "",
    this.username = "",
    this.category = "",
  });

  factory CreatorModel.fromMap(Map<String, dynamic> map) {
    return CreatorModel(
      id: map["_id"] != null ? ParsingHelper.parseStringMethod(map["_id"]) : "",
      displayName: map["displayName"] != null ? ParsingHelper.parseStringMethod(map["displayName"]) : "",
      bio: map["creatorHeadline"] != null ? ParsingHelper.parseStringMethod(map["creatorHeadline"]) : "",
      profilePicture: map["profilePicture"] != null ? ParsingHelper.parseStringMethod(map["profilePicture"]) : "",
      profileCover: map["profileCover"] != null ? ParsingHelper.parseStringMethod(map["profileCover"]) : "",
      username: map["creatorUsername"] != null ? ParsingHelper.parseStringMethod(map["creatorUsername"]) : "",
      category: map["creatorCategory"] != null ? ParsingHelper.parseStringMethod(map["creatorCategory"]) : "",
    );
  }

  factory CreatorModel.fromPostCreatorMap(Map<String, dynamic> map) {
    return CreatorModel(
      id: map["id"] != null ? ParsingHelper.parseStringMethod(map["id"]) : "",
      displayName: map["displayName"] != null ? ParsingHelper.parseStringMethod(map["displayName"]) : "",
      profilePicture: map["profilePicture"] != null ? ParsingHelper.parseStringMethod(map["profilePicture"]) : "",
      profileCover: map["profileCover"] != null ? ParsingHelper.parseStringMethod(map["profileCover"]) : "",
      username: map["username"] != null ? ParsingHelper.parseStringMethod(map["username"]) : "",
      category: map["category"] != null ? ParsingHelper.parseStringMethod(map["category"]) : "",
      bio: "",
    );
  }

  Map<String, dynamic> toMap() {
    return {
      "_id": id,
      "displayName": displayName,
      "creatorHeadline": bio,
      "profilePicture": profilePicture,
      "profileCover": profileCover,
      "creatorUsername": username,
      "creatorCategory": category,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
