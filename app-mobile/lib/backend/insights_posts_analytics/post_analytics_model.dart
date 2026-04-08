import 'package:patreon-clone/backend/insights_posts_analytics/post_analytics_post_model.dart';

class PostsAnalyticsModel {
  int impressionsToday;
  int totalImpressions;
  double impressionChange;
  int engagementsToday;
  int totalEngagements;
  double engagementChange;
  List<int> impressionData;
  List<int> engagementData;
  List<String> periods;
  List<PostAnalyticsPostModel> topPerformingPosts;

  PostsAnalyticsModel({
    this.impressionsToday = 0,
    this.totalImpressions = 0,
    this.impressionChange = 0.0,
    this.engagementsToday = 0,
    this.totalEngagements = 0,
    this.engagementChange = 0.0,
    this.impressionData = const [],
    this.engagementData = const [],
    this.periods = const [],
    this.topPerformingPosts = const [],
  });

  factory PostsAnalyticsModel.fromMap(Map<String, dynamic> map) {
    int asInt(dynamic v) => v == null ? 0 : int.tryParse(v.toString()) ?? 0;
    double asDouble(dynamic v) => v == null ? 0.0 : double.tryParse(v.toString()) ?? 0.0;

    // Outputs we’ll fill (aligned by index)
    List<int> impressionDataList = <int>[];
    List<int> engagementDataList = <int>[];
    List<String> periodsList = <String>[];

    // If lists are already provided, use them (and align by min length)
    if (map['impressionData'] is List && map['engagementData'] is List && map['periods'] is List) {
      final li = (map['impressionData'] as List).map(asInt).toList();
      final le = (map['engagementData'] as List).map(asInt).toList();
      final lp = (map['periods'] as List).map((e) => e.toString()).toList();
      final cut = [li.length, le.length, lp.length]..sort();
      final n = cut.first;
      impressionDataList = li.take(n).toList();
      engagementDataList = le.take(n).toList();
      periodsList = lp.take(n).toList();
    } else {
      // Map form from API: {"YYYY-MM-DD":N} or {"May Week 3":N}, etc.
      final impMap = map['impressionData'] is Map ? Map<String, dynamic>.from(map['impressionData']) : <String, dynamic>{};
      final engMap = map['engagementData'] is Map ? Map<String, dynamic>.from(map['engagementData']) : <String, dynamic>{};

      // Build a single ordered list of keys.
      // Priority: provided periods[] -> impression keys -> engagement keys
      final ordered = <String>[];
      if (map['periods'] is List) {
        for (final e in (map['periods'] as List)) {
          final k = e.toString();
          if (!ordered.contains(k)) ordered.add(k);
        }
      }
      if (impMap.isNotEmpty) {
        impMap.forEach((k, _) {
          if (!ordered.contains(k)) ordered.add(k);
        });
      }
      if (engMap.isNotEmpty) {
        engMap.forEach((k, _) {
          if (!ordered.contains(k)) ordered.add(k);
        });
      }

      // Align values by the unified key order (default missing to 0)
      for (final k in ordered) {
        periodsList.add(k);
        impressionDataList.add(asInt(impMap[k]));
        engagementDataList.add(asInt(engMap[k]));
      }
    }

    return PostsAnalyticsModel(
      impressionsToday: asInt(map['impressionsToday']),
      totalImpressions: asInt(map['totalImpressions']),
      impressionChange: asDouble(map['impressionChange']),
      engagementsToday: asInt(map['engagementsToday']),
      totalEngagements: asInt(map['totalEngagements']),
      engagementChange: asDouble(map['engagementChange']),
      impressionData: impressionDataList,
      engagementData: engagementDataList,
      periods: periodsList,
      topPerformingPosts: map['topPerformingPosts'] is List
          ? (map['topPerformingPosts'] as List).map((e) => PostAnalyticsPostModel.fromMap(Map<String, dynamic>.from(e))).toList()
          : const [],
    );
  }
}
