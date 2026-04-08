import 'package:patreon-clone/models/creator/tier_breakdown_data_model.dart';

import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

class CreatorStatsModel {
  int totalPosts;
  int totalMembers;
  List<TierBreakdownModel> tierBreakdown;
  int totalEarnings;
  List<String> socialLinks;

  CreatorStatsModel({
    this.totalPosts = 0,
    this.totalMembers = 0,
    this.tierBreakdown = const [],
    this.totalEarnings = 0,
    this.socialLinks = const [],
  });

  factory CreatorStatsModel.fromMap(Map<String, dynamic> map) {
    return CreatorStatsModel(
      totalPosts: map['totalPosts'] != null ? ParsingHelper.parseIntMethod(map['totalPosts']) : 0,
      totalMembers: map['totalMembers'] != null ? ParsingHelper.parseIntMethod(map['totalMembers']) : 0,
      tierBreakdown: map['tierBreakdown'] != null && map['tierBreakdown'] is List
          ? (map['tierBreakdown'] as List).map((e) => TierBreakdownModel.fromMap(Map<String, dynamic>.from(e))).toList()
          : const [],
      totalEarnings: map['totalEarnings'] != null ? ParsingHelper.parseIntMethod(map['totalEarnings']) : 0,
      socialLinks: map['socialLinks'] != null && map['socialLinks'] is List
          ? List<String>.from((map['socialLinks'] as List).map((e) => ParsingHelper.parseStringMethod(e)))
          : const [],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'totalPosts': totalPosts,
      'totalMembers': totalMembers,
      'tierBreakdown': tierBreakdown.map((e) => e.toMap()).toList(),
      'totalEarnings': totalEarnings,
      'socialLinks': socialLinks,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
