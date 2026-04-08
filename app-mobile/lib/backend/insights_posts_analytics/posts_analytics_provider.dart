import 'package:patreon-clone/backend/common/common_provider.dart';
import 'package:patreon-clone/backend/insights_posts_analytics/post_analytics_post_model.dart';

class PostsAnalyticsProvider extends CommonProvider {
  PostsAnalyticsProvider() {
    isLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);
    impressionsToday = CommonProviderPrimitiveParameter<int>(value: 0, notify: notify);
    totalImpressions = CommonProviderPrimitiveParameter<int>(value: 0, notify: notify);
    impressionChange = CommonProviderPrimitiveParameter<double>(value: 0.0, notify: notify);
    engagementsToday = CommonProviderPrimitiveParameter<int>(value: 0, notify: notify);
    totalEngagements = CommonProviderPrimitiveParameter<int>(value: 0, notify: notify);
    engagementChange = CommonProviderPrimitiveParameter<double>(value: 0.0, notify: notify);
    impressionData = CommonProviderListParameter<int>(list: [], notify: notify);
    engagementData = CommonProviderListParameter<int>(list: [], notify: notify);
    periods = CommonProviderListParameter<String>(list: [], notify: notify);
    topPerformingPosts = CommonProviderListParameter<PostAnalyticsPostModel>(list: [], notify: notify);
  }

  late CommonProviderPrimitiveParameter<bool> isLoading;
  late CommonProviderPrimitiveParameter<int> impressionsToday;
  late CommonProviderPrimitiveParameter<int> totalImpressions;
  late CommonProviderPrimitiveParameter<double> impressionChange;
  late CommonProviderPrimitiveParameter<int> engagementsToday;
  late CommonProviderPrimitiveParameter<int> totalEngagements;
  late CommonProviderPrimitiveParameter<double> engagementChange;
  late CommonProviderListParameter<int> impressionData;
  late CommonProviderListParameter<int> engagementData;
  late CommonProviderListParameter<String> periods;
  late CommonProviderListParameter<PostAnalyticsPostModel> topPerformingPosts;
}
