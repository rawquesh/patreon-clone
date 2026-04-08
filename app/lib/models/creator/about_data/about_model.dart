import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';
import 'package:patreon-clone/models/social_link/social_links.dart';

class AboutModel {
  String introVideoUrl;
  String bio;
  List<SocialLinkModel> socialLinks;

  AboutModel({
    this.introVideoUrl = '',
    this.bio = '',
    this.socialLinks = const [],
  });

  factory AboutModel.fromMap(Map<String, dynamic> map) {
    List<SocialLinkModel> links = [];
    if (map['socialLinks'] != null) {
      if (map['socialLinks'] is List) {
        links = (map['socialLinks'] as List)
            .map((e) => SocialLinkModel.fromMap(Map<String, dynamic>.from(e)))
            .toList();
      } else if (map['socialLinks'] is Map) {
        links = (map['socialLinks'] as Map<String, dynamic>)
            .entries
            .map((entry) =>
            SocialLinkModel(
              platform: entry.key,
              url: ParsingHelper.parseStringMethod(entry.value),
            ))
            .toList();
      }
    }
    return AboutModel(
      introVideoUrl: ParsingHelper.parseStringMethod(map['introVideoUrl']),
      bio: ParsingHelper.parseStringMethod(map['bio']),
      socialLinks: links,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'introVideoUrl': introVideoUrl,
      'bio': bio,
      'socialLinks': socialLinks.map((e) => e.toMap()).toList(),
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
