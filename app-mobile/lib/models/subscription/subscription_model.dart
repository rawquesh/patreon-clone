import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';
import 'package:patreon_clone/models/creator/creator_model.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';

class SubscriptionModel {
  String id;
  String subscriber;
  CreatorModel? creator;
  MembershipModel? membership;
  double monthlyRate;
  String status;
  DateTime currentPeriodStart;
  DateTime currentPeriodEnd;
  bool isTrial;
  bool hasDiscount;
  DateTime createdAt;
  DateTime updatedAt;
  int version;
  int daysUntilRenewal;
  double nextBillingAmount;
  String stripeSubscriptionId;

  SubscriptionModel({
    this.id = '',
    this.subscriber = '',
    this.creator,
    this.membership,
    this.monthlyRate = 0,
    this.status = '',
    DateTime? currentPeriodStart,
    DateTime? currentPeriodEnd,
    this.isTrial = false,
    this.hasDiscount = false,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.version = 0,
    this.daysUntilRenewal = 0,
    this.nextBillingAmount = 0,
    this.stripeSubscriptionId = '',
  })  : currentPeriodStart = currentPeriodStart ?? DateTime.now(),
        currentPeriodEnd = currentPeriodEnd ?? DateTime.now(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory SubscriptionModel.fromMap(Map<String, dynamic> map) {
    return SubscriptionModel().updateFromMap(map);
  }

  SubscriptionModel updateFromMap(Map<String, dynamic> map) {
    id = map['_id'] != null ? ParsingHelper.parseStringMethod(map['_id']) : id;
    subscriber = map['subscriber'] != null
        ? ParsingHelper.parseStringMethod(map['subscriber'])
        : subscriber;

    if (map['creator'] != null && map['creator'] is Map<String, dynamic>) {
      creator = CreatorModel.fromMap(
          ParsingHelper.parseMapMethod(map['creator']));
    }

    if (map['membership'] != null && map['membership'] is Map<String, dynamic>) {
      Map<String, dynamic> membershipMap =
      ParsingHelper.parseMapMethod(map['membership']);
      if (membershipMap['monthlyPrice'] == null &&
          membershipMap['monthlyRate'] != null) {
        membershipMap['monthlyPrice'] = membershipMap['monthlyRate'];
      }
      membership = MembershipModel.fromMap(membershipMap);
    }

    monthlyRate = map['monthlyRate'] != null
        ? ParsingHelper.parseDoubleMethod(map['monthlyRate'])
        : monthlyRate;
    status = map['status'] != null
        ? ParsingHelper.parseStringMethod(map['status'])
        : status;
    currentPeriodStart = map['currentPeriodStart'] != null
        ? ParsingHelper.parseDateTimeMethod(map['currentPeriodStart']) ??
        currentPeriodStart
        : currentPeriodStart;
    currentPeriodEnd = map['currentPeriodEnd'] != null
        ? ParsingHelper.parseDateTimeMethod(map['currentPeriodEnd']) ??
        currentPeriodEnd
        : currentPeriodEnd;
    isTrial = map['isTrial'] != null
        ? ParsingHelper.parseBoolMethod(map['isTrial'])
        : isTrial;
    hasDiscount = map['hasDiscount'] != null
        ? ParsingHelper.parseBoolMethod(map['hasDiscount'])
        : hasDiscount;
    createdAt = map['createdAt'] != null
        ? ParsingHelper.parseDateTimeMethod(map['createdAt']) ?? createdAt
        : createdAt;
    updatedAt = map['updatedAt'] != null
        ? ParsingHelper.parseDateTimeMethod(map['updatedAt']) ?? updatedAt
        : updatedAt;
    version = map['__v'] != null
        ? ParsingHelper.parseIntMethod(map['__v'])
        : version;
    daysUntilRenewal = map['daysUntilRenewal'] != null
        ? ParsingHelper.parseIntMethod(map['daysUntilRenewal'])
        : daysUntilRenewal;
    nextBillingAmount = map['nextBillingAmount'] != null
        ? ParsingHelper.parseDoubleMethod(map['nextBillingAmount'])
        : nextBillingAmount;
    stripeSubscriptionId = map['stripeSubscriptionId'] != null
        ? ParsingHelper.parseStringMethod(map['stripeSubscriptionId'])
        : stripeSubscriptionId;
    return this;
  }

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      '_id': id,
      'subscriber': subscriber,
      'creator': creator?.toMap(),
      'membership': membership?.toMap(),
      'monthlyRate': monthlyRate,
      'status': status,
      'currentPeriodStart':
      toJson ? currentPeriodStart.toIso8601String() : currentPeriodStart,
      'currentPeriodEnd':
      toJson ? currentPeriodEnd.toIso8601String() : currentPeriodEnd,
      'isTrial': isTrial,
      'hasDiscount': hasDiscount,
      'createdAt': toJson ? createdAt.toIso8601String() : createdAt,
      'updatedAt': toJson ? updatedAt.toIso8601String() : updatedAt,
      '__v': version,
      'daysUntilRenewal': daysUntilRenewal,
      'nextBillingAmount': nextBillingAmount,
      'stripeSubscriptionId': stripeSubscriptionId,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap(toJson: true));
}