import 'package:patreon-clone/models/social_link/social_links.dart';

import 'package:patreon-clone/utils/my_utils.dart';

class UpdateSocialLinksRequestModel {
  List<SocialLinkModel> socialLinks;

  UpdateSocialLinksRequestModel({this.socialLinks = const []});

  Map<String, dynamic> toMap() {
    return {
      'socialLinks': socialLinks.map((e) => e.toMap()).toList(),
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
