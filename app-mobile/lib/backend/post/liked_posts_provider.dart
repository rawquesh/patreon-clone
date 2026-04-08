import 'package:patreon-clone/backend/common/common_provider.dart';

class LikedPostsProvider extends CommonProvider {
  LikedPostsProvider() {
    likedPosts = CommonProviderMapParameter<String, bool>(map: {}, notify: notify);
    likeCounts = CommonProviderMapParameter<String, int>(map: {}, notify: notify);
    likedComments = CommonProviderMapParameter<String, bool>(map: {}, notify: notify);
  }

  late CommonProviderMapParameter<String, bool> likedPosts;
  late CommonProviderMapParameter<String, int> likeCounts;
  late CommonProviderMapParameter<String, bool> likedComments;
}
