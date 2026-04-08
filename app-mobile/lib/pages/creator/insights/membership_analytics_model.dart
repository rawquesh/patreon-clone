import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

import 'membership_chart_point_model.dart';

class MembershipAnalyticsModel {
  int activeMembers;
  double activeGrowth;
  int newMembers;
  int upgradedMembers;
  int cancelledMembers;

  /// NEW: ordered points from the JSON map (labels preserved)
  List<MembershipChartPointModel> membershipPoints;

  /// (Optional) keep the old ints for compatibility, but stop using it in UI
  List<int> membershipData;

  List<MembershipModel> tiers;

  MembershipAnalyticsModel({
    this.activeMembers = 0,
    this.activeGrowth = 0.0,
    this.newMembers = 0,
    this.upgradedMembers = 0,
    this.cancelledMembers = 0,
    this.membershipPoints = const [],
    this.membershipData = const [],
    this.tiers = const [],
  });

  factory MembershipAnalyticsModel.fromMap(Map<String, dynamic> map) {
    final List<MembershipChartPointModel> points = [];
    final List<int> legacyValues = [];

    if (map['membershipData'] != null && map['membershipData'] is Map) {
      // LinkedHashMap preserves insertion order of JSON object keys in Dart
      final dataMap = Map<String, dynamic>.from(map['membershipData']);

      dataMap.forEach((k, v) {
        final parsed = ParsingHelper.parseDoubleMethod(v);
        points.add(MembershipChartPointModel(label: k.toString(), value: parsed));
        legacyValues.add(parsed.toInt());
      });
    }

    return MembershipAnalyticsModel(
      activeMembers: ParsingHelper.parseIntMethod(map['activeMembers']),
      activeGrowth: ParsingHelper.parseDoubleMethod(map['activeGrowth']),
      newMembers: ParsingHelper.parseIntMethod(map['newMembers']),
      upgradedMembers: ParsingHelper.parseIntMethod(map['upgradedMembers']),
      cancelledMembers: ParsingHelper.parseIntMethod(map['cancelledMembers']),
      membershipPoints: points,
      membershipData: legacyValues, // keep but don't use in chart
      tiers: map['tiers'] is List
          ? (map['tiers'] as List).map((e) => MembershipModel.fromMap(Map<String, dynamic>.from(e))).toList()
          : const [],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'activeMembers': activeMembers,
      'activeGrowth': activeGrowth,
      'newMembers': newMembers,
      'upgradedMembers': upgradedMembers,
      'cancelledMembers': cancelledMembers,
      // If you ever need to send back:
      'membershipData': {for (final p in membershipPoints) p.label: p.value},
      'tiers': tiers.map((e) => e.toMap()).toList(),
    };
  }
}
