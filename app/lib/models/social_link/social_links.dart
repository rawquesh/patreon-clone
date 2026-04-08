import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

class SocialLinkModel {
  String platform;
  String url;

  SocialLinkModel({
    required this.platform,
    required this.url,
  });

  factory SocialLinkModel.fromMap(Map<String, dynamic> map) {
    return SocialLinkModel(
      platform: ParsingHelper.parseStringMethod(map['platform']),
      url: ParsingHelper.parseStringMethod(map['url']),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'platform': platform,
      'url': url,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
