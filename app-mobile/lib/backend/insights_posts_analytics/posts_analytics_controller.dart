import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/backend/insights_posts_analytics/posts_analytics_provider.dart';
import 'package:patreon-clone/backend/insights_posts_analytics/posts_analytics_repository.dart';

class PostsAnalyticsController {
  final PostsAnalyticsProvider provider;
  final PostsAnalyticsRepository _repository;

  PostsAnalyticsController({required this.provider, PostsAnalyticsRepository? repository})
      : _repository = repository ?? PostsAnalyticsRepository();

  Future<void> fetchAnalytics({String timeRange = '7d', bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final result = await _repository.getAnalytics(timeRange: timeRange);
    if (result != null) {
      provider.impressionsToday.set(value: result.impressionsToday, isNotify: false);
      provider.totalImpressions.set(value: result.totalImpressions, isNotify: false);
      provider.impressionChange.set(value: result.impressionChange, isNotify: false);
      provider.engagementsToday.set(value: result.engagementsToday, isNotify: false);
      provider.totalEngagements.set(value: result.totalEngagements, isNotify: false);
      provider.engagementChange.set(value: result.engagementChange, isNotify: false);
      provider.impressionData.setList(list: result.impressionData, isClear: true, isNotify: false);
      provider.engagementData.setList(list: result.engagementData, isClear: true, isNotify: false);
      provider.periods.setList(list: result.periods, isClear: true, isNotify: false);
      provider.topPerformingPosts.setList(list: result.topPerformingPosts, isClear: true, isNotify: false);
      provider.notify(isNotify: isNotify);
    } else {
      MyPrint.printOnConsole('Posts analytics response null');
    }
    provider.isLoading.set(value: false, isNotify: isNotify);
  }
}
