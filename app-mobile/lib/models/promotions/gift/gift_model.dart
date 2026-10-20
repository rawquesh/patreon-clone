import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';

class GiftModel {
  String id;
  String title;
  String code;
  String description;
  String giftType;
  double redeemed;
  List<Map<String, String>> applicableTiers;
  double durationDays;
  String applicableTo;
  DateTime startDate;
  DateTime endDate;
  bool isPublic;
  DateTime createdAt;
  DateTime updatedAt;

  GiftModel({
    this.id = "",
    this.title = "",
    this.code = "",
    this.description = "",
    this.giftType = "",
    this.redeemed = 0.0,
    this.applicableTiers = const [],
    this.durationDays = 0.0,
    this.applicableTo = "",
    DateTime? startDate,
    DateTime? endDate,
    this.isPublic = false,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : startDate = startDate ?? DateTime.now(),
        endDate = endDate ?? DateTime.now(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  /// Factory to create a new instance from a map
  factory GiftModel.fromMap(Map<String, dynamic> map) {
    return GiftModel().updateFromMap(map);
  }

  /// Updates this instance from a map
  GiftModel updateFromMap(Map<String, dynamic> map) {
    id = map["id"] != null ? ParsingHelper.parseStringMethod(map["id"]) : id;
    title = map["title"] != null ? ParsingHelper.parseStringMethod(map["title"]) : title;
    code = map["code"] != null ? ParsingHelper.parseStringMethod(map["code"]) : code;
    description = map["description"] != null ? ParsingHelper.parseStringMethod(map["description"]) : description;
    giftType = map["giftType"] != null ? ParsingHelper.parseStringMethod(map["giftType"]) : giftType;
    redeemed = map["redeemed"] != null ? ParsingHelper.parseDoubleMethod(map["redeemed"]) : redeemed;
    durationDays = map["durationDays"] != null ? ParsingHelper.parseDoubleMethod(map["durationDays"]) : durationDays;
    applicableTo = map["applicableTo"] != null ? ParsingHelper.parseStringMethod(map["applicableTo"]) : applicableTo;
    startDate = map["startDate"] != null
        ? ParsingHelper.parseDateTimeMethod(map["startDate"]) ?? startDate
        : startDate;
    endDate = map["endDate"] != null
        ? ParsingHelper.parseDateTimeMethod(map["endDate"]) ?? endDate
        : endDate;
    isPublic = map["isPublic"] != null ? ParsingHelper.parseBoolMethod(map["isPublic"]) : isPublic;
    createdAt = map["createdAt"] != null
        ? ParsingHelper.parseDateTimeMethod(map["createdAt"]) ?? createdAt
        : createdAt;
    updatedAt = map["updatedAt"] != null
        ? ParsingHelper.parseDateTimeMethod(map["updatedAt"]) ?? updatedAt
        : updatedAt;

    applicableTiers = [];
    if (map["applicableTiers"] is List) {
      for (var item in map["applicableTiers"]) {
        if (item is Map<String, dynamic>) {
          final id = ParsingHelper.parseStringMethod(item["id"]);
          final name = ParsingHelper.parseStringMethod(item["name"]);
          if (id.isNotEmpty && name.isNotEmpty) {
            applicableTiers.add({"id": id, "name": name});
          }
        } else if (item is String) {
          // Fallback: backend returned just IDs (rare case)
          applicableTiers.add({"id": item, "name": ""});
        }
      }
    }
    return this;
  }

  /// Converts instance to a Map
  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      "id": id,
      "title": title,
      "code": code,
      "description": description,
      "giftType": giftType,
      "redeemed": redeemed,
      "applicableTiers": applicableTiers.map((e) => e["id"] ?? "").where((id) => id.isNotEmpty).toList(),
      "durationDays": durationDays,
      "applicableTo": applicableTo,
      "startDate": toJson ? startDate.toIso8601String() : startDate,
      "endDate": toJson ? endDate.toIso8601String() : endDate,
      "isPublic": isPublic,
      "createdAt": toJson ? createdAt.toIso8601String() : createdAt,
      "updatedAt": toJson ? updatedAt.toIso8601String() : updatedAt,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap(toJson: true));
}