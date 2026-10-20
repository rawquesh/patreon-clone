import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';

class DiscountModel {
  String id;
  String title;
  String code;
  String description;
  double discountNumber;
  String applicableTo;
  bool isPublic;
  String percentageType;
  DateTime startDate;
  DateTime endDate;
  List<Map<String, String>> applicableTiers;
  String status;
  double redeemed;
  DateTime createdAt;
  DateTime updatedAt;

  DiscountModel({
    this.id = "",
    this.title = "",
    this.code = "",
    this.description = "",
    this.discountNumber = 0.0,
    this.applicableTo = "",
    this.isPublic = false,
    this.percentageType = "",
    DateTime? startDate,
    DateTime? endDate,
    this.applicableTiers = const [],
    this.status = "",
    this.redeemed = 0.0,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : startDate = startDate ?? DateTime.now(),
        endDate = endDate ?? DateTime.now(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory DiscountModel.fromMap(Map<String, dynamic> map) {
    return DiscountModel().updateFromMap(map);
  }

  DiscountModel updateFromMap(Map<String, dynamic> map) {
    id = map["id"] != null ? ParsingHelper.parseStringMethod(map["id"]) : id;
    title = map["title"] != null ? ParsingHelper.parseStringMethod(map["title"]) : title;
    code = map["code"] != null ? ParsingHelper.parseStringMethod(map["code"]) : code;
    description = map["description"] != null ? ParsingHelper.parseStringMethod(map["description"]) : description;
    discountNumber = map["discountNumber"] != null ? ParsingHelper.parseDoubleMethod(map["discountNumber"]) : discountNumber;
    applicableTo = map["applicableTo"] != null ? ParsingHelper.parseStringMethod(map["applicableTo"]) : applicableTo;
    isPublic = map["isPublic"] != null ? ParsingHelper.parseBoolMethod(map["isPublic"]) : isPublic;
    percentageType = map["percentageType"] != null ? ParsingHelper.parseStringMethod(map["percentageType"]) : percentageType;
    startDate = map["startDate"] != null ? ParsingHelper.parseDateTimeMethod(map["startDate"]) ?? startDate : startDate;
    endDate = map["endDate"] != null ? ParsingHelper.parseDateTimeMethod(map["endDate"]) ?? endDate : endDate;
    status = map["status"] != null ? ParsingHelper.parseStringMethod(map["status"]) : status;
    redeemed = map["redeemed"] != null ? ParsingHelper.parseDoubleMethod(map["redeemed"]) : redeemed;
    createdAt = map["createdAt"] != null ? ParsingHelper.parseDateTimeMethod(map["createdAt"]) ?? createdAt : createdAt;
    updatedAt = map["updatedAt"] != null ? ParsingHelper.parseDateTimeMethod(map["updatedAt"]) ?? updatedAt : updatedAt;

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

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      "id": id,
      "title": title,
      "code": code,
      "description": description,
      "discountNumber": discountNumber,
      "applicableTo": applicableTo,
      "isPublic": isPublic,
      "percentageType": percentageType,
      "startDate": toJson ? startDate.toUtc().toIso8601String() : startDate,
      "endDate": toJson ? endDate.toUtc().toIso8601String() : endDate,
      "applicableTiers": applicableTiers.map((e) => e["id"] ?? "").where((id) => id.isNotEmpty).toList(),
      "status": status,
      "redeemed": redeemed,
      "createdAt": toJson ? createdAt.toUtc().toIso8601String() : createdAt,
      "updatedAt": toJson ? updatedAt.toUtc().toIso8601String() : updatedAt,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap(toJson: true));
}
