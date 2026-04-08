import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

class MembershipModel {
  String id = "";
  String name = "";
  String description = "";
  double monthlyPrice = 0.0;
  double monthlyRate = 0.0;
  double yearlyPrice = 0.0;
  List<String> benefits = [];
  bool isLimited = false;
  int seatsLeft = 0;
  bool isFeatured = false;
  bool isActive = true;
  String coverImage = "";
  int subscriberCount = 0;
  String creator = "";
  double totalEarnings = 0.0;
  String stripePriceId;
  String stripeProductId;
  int analyticsCount;
  int analyticsGrowth;

  MembershipModel({
    this.id = "",
    this.name = "",
    this.description = "",
    this.monthlyPrice = 0.0,
    this.monthlyRate = 0.0,
    this.yearlyPrice = 0.0,
    this.benefits = const [],
    this.isLimited = false,
    this.seatsLeft = 0,
    this.isFeatured = false,
    this.isActive = true,
    this.coverImage = "",
    this.subscriberCount = 0,
    this.creator = "",
    this.totalEarnings = 0.0,
    this.stripePriceId = '',
    this.stripeProductId = '',
    this.analyticsCount = 0,
    this.analyticsGrowth = 0,
  });

  factory MembershipModel.fromMap(Map<String, dynamic> map) {
    return MembershipModel(
      id: map["_id"] != null ? ParsingHelper.parseStringMethod(map["_id"]) : "",
      name: map["name"] != null ? ParsingHelper.parseStringMethod(map["name"]) : "",
      description: map["description"] != null ? ParsingHelper.parseStringMethod(map["description"]) : "",
      monthlyPrice: map["monthlyPrice"] != null ? ParsingHelper.parseDoubleMethod(map["monthlyPrice"]) : 0.0,
      monthlyRate: map["monthlyRate"] != null ? ParsingHelper.parseDoubleMethod(map["monthlyRate"]) : 0.0,
      yearlyPrice: map["yearlyPrice"] != null ? ParsingHelper.parseDoubleMethod(map["yearlyPrice"]) : 0.0,
      benefits: map["benefits"] != null ? ParsingHelper.parseListMethod(map["benefits"]) : [],
      isLimited: map["isLimited"] != null ? ParsingHelper.parseBoolMethod(map["isLimited"]) : false,
      seatsLeft: map["seatsLeft"] != null ? ParsingHelper.parseIntMethod(map["seatsLeft"]) : 0,
      isFeatured: map["isFeatured"] != null ? ParsingHelper.parseBoolMethod(map["isFeatured"]) : false,
      isActive: map["isActive"] != null ? ParsingHelper.parseBoolMethod(map["isActive"]) : true,
      coverImage: map["coverImage"] != null ? ParsingHelper.parseStringMethod(map["coverImage"]) : "",
      subscriberCount: map["subscriberCount"] != null ? ParsingHelper.parseIntMethod(map["subscriberCount"]) : 0,
      creator: map["creator"] != null ? ParsingHelper.parseStringMethod(map["creator"]) : "",
      totalEarnings: map["totalEarnings"] != null ? ParsingHelper.parseDoubleMethod(map["totalEarnings"]) : 0.0,
      stripePriceId: map["stripePriceId"] != null ? ParsingHelper.parseStringMethod(map["stripePriceId"]) : '',
      stripeProductId: map["stripeProductId"] != null ? ParsingHelper.parseStringMethod(map["stripeProductId"]) : '',
      analyticsCount: map["count"] != null ? ParsingHelper.parseIntMethod(map["count"]) : 0,
      analyticsGrowth: map["growth"] != null ? ParsingHelper.parseIntMethod(map["growth"]) : 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      "_id": id,
      "name": name,
      "description": description,
      "monthlyPrice": monthlyPrice,
      "monthlyRate": monthlyRate,
      "yearlyPrice": yearlyPrice,
      "benefits": benefits,
      "isLimited": isLimited,
      "seatsLeft": seatsLeft,
      "isFeatured": isFeatured,
      "isActive": isActive,
      "coverImage": coverImage,
      "subscriberCount": subscriberCount,
      "creator": creator,
      "totalEarnings": totalEarnings,
      "stripePriceId": stripePriceId,
      "stripeProductId": stripeProductId,
      "count": analyticsCount,
      "growth": analyticsGrowth,
    };
  }

  bool get isFree => monthlyPrice == 0 && yearlyPrice == 0;

  double get yearlySavings {
    if (monthlyPrice == 0) return 0;
    return (monthlyPrice * 12) - yearlyPrice;
  }

  double get yearlySavingsPercentage {
    if (monthlyPrice == 0) return 0;
    double totalMonthlyPrice = monthlyPrice * 12;
    if (totalMonthlyPrice == 0) return 0;
    return ((totalMonthlyPrice - yearlyPrice) / totalMonthlyPrice) * 100;
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
