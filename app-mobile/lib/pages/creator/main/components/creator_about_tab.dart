import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:html_unescape/html_unescape.dart';
import 'package:patreon_clone/models/social_link/social_links.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

import 'package:patreon_clone/backend/authentication/authentication_provider.dart';
import 'package:patreon_clone/backend/creator_section/my_creator_page_controller.dart';

class CreatorAboutTab extends StatefulWidget {
  static const String routeName = "/CreatorAboutTab";

  const CreatorAboutTab({super.key});

  @override
  State<CreatorAboutTab> createState() => _CreatorAboutTabState();
}

class _CreatorAboutTabState extends State<CreatorAboutTab> with MySafeState {
  late AuthenticationProvider authenticationProvider;
  late MyCreatorPageController myCreatorPageController;
  String introVideoUrl = '';
  String bio = '';
  List<SocialLinkModel> socialLinks = [];

  YoutubePlayerController? _youtubeController;
  bool _isVideoUrlValid = false;

  static const double _cardRadius = 12.0;
  // static const double _spacing = 12.0;

  @override
  void initState() {
    super.initState();
    authenticationProvider = context.read<AuthenticationProvider>();
    myCreatorPageController = MyCreatorPageController();
    getData(isNotify: true);
  }

  Future<void> getData({bool isNotify = true}) async {
    final username = authenticationProvider.userModel.get()?.creatorUsername ?? '';
    if (username.isEmpty) return;

    final about = await myCreatorPageController.fetchCreatorAbout(username);
    if (about != null) {
      introVideoUrl = about.introVideoUrl;
      bio = about.bio;
      socialLinks = about.socialLinks;
      _initializeVideoPlayer();
      if (isNotify) mySetState();
    }
  }

  void _initializeVideoPlayer() {
    _youtubeController?.dispose();
    _youtubeController = null;
    _isVideoUrlValid = false;

    if (introVideoUrl.isNotEmpty) {
      final videoId = YoutubePlayer.convertUrlToId(introVideoUrl);
      if (videoId != null) {
        _youtubeController = YoutubePlayerController(
          initialVideoId: videoId,
          flags: const YoutubePlayerFlags(
            autoPlay: false,
            mute: false,
            enableCaption: true,
            captionLanguage: 'en',
          ),
        );
        _isVideoUrlValid = true;
      }
    }
  }

  @override
  void dispose() {
    _youtubeController?.dispose();
    super.dispose();
  }

  void _navigateToEditAboutScreen() {
    context.pushNamed(
      Routes.addEditAbout,
      extra: {
        'initialIntroVideo': introVideoUrl,
        'initialBio': bio,
        'initialSocialLinks': socialLinks,
      },
    ).then((result) {
      if (result == true) {
        getData(isNotify: true);
      }
    });
  }

  Future<void> _launchUrl(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.inAppBrowserView);
    }
  }

  IconData _getSocialIcon(String platform) {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return FontAwesomeIcons.youtube;
      case 'instagram':
        return FontAwesomeIcons.instagram;
      case 'twitter':
        return FontAwesomeIcons.xTwitter;
      case 'facebook':
        return FontAwesomeIcons.facebook;
      case 'tiktok':
        return FontAwesomeIcons.tiktok;
      case 'twitch':
        return FontAwesomeIcons.twitch;
      default:
        return FontAwesomeIcons.link;
    }
  }

  Color _getSocialColor(String platform) {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return const Color(0xFFFF0000);
      case 'instagram':
        return const Color(0xFFE4405F);
      case 'twitter':
        return const Color(0xFF1DA1F2);
      case 'facebook':
        return const Color(0xFF1877F2);
      case 'tiktok':
        return const Color(0xFF000000);
      case 'twitch':
        return const Color(0xFF9146FF);
      default:
        return Colors.grey[600]!;
    }
  }

  Widget _buildEmptyState() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(_cardRadius),
        border: Border.all(color: Colors.grey[200]!),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          Icon(Icons.info_outline, size: 40, color: Colors.grey[400]),
          const SizedBox(height: 8),
          Text(
            'No About Information',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.grey[700]).withEpilogue,
          ),
          const SizedBox(height: 4),
          Text(
            'Add your intro video, bio, and social links.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Colors.grey[600]).withEpilogue,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    final HtmlUnescape unescape = HtmlUnescape();
    final String decodedBio = unescape.convert(bio);
    final bool hasContent = introVideoUrl.isNotEmpty || bio.isNotEmpty || socialLinks.isNotEmpty;

    final List<Widget> sliverContent = [];

    // Header
    sliverContent.add(
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "About Details",
              style: Theme.of(context)
                  .textTheme
                  .labelLarge
                  ?.copyWith(fontWeight: FontWeight.bold, color: Colors.black87)
                  .withEpilogue,
            ),
            ElevatedButton.icon(
              onPressed: _navigateToEditAboutScreen, // Updated this line
              icon: Icon(
                hasContent ? Icons.edit : Icons.add,
                size: 16,
                color: themeData.colorScheme.onPrimary,
              ),
              label: Text(
                hasContent ? 'Edit' : 'Add',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: themeData.colorScheme.onPrimary,
                ).withEpilogue,
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: themeData.primaryColor,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
          ],
        ),
      ),
    );

    if (!hasContent) {
      sliverContent.add(Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: _buildEmptyState(),
      ));
    } else {
      if (_isVideoUrlValid && _youtubeController != null) {
        sliverContent.add(
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(_cardRadius),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Icon(Icons.play_circle_outline, size: 18, color: themeData.primaryColor),
                  const SizedBox(width: 8),
                  Text('Intro Video', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600).withEpilogue),
                ]),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: YoutubePlayer(controller: _youtubeController!, showVideoProgressIndicator: true),
                ),
              ],
            ),
          ),
        );
      }

      if (bio.isNotEmpty) {
        sliverContent.add(
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(_cardRadius),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Icon(Icons.person_outline, size: 18, color: themeData.primaryColor),
                  const SizedBox(width: 8),
                  Text('About Me', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600).withEpilogue),
                ]),
                const SizedBox(height: 6),
                Html(
                  data: decodedBio.trim().isNotEmpty ? decodedBio : "<p>No bio added yet.</p>",
                  style: {
                    "p": Style(fontSize: FontSize(14), color: themeData.textTheme.labelMedium?.color),
                  },
                ),
              ],
            ),
          ),
        );
      }

      if (socialLinks.isNotEmpty) {
        sliverContent.add(
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(_cardRadius),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Icon(Icons.link, size: 18, color: themeData.primaryColor),
                  const SizedBox(width: 8),
                  Text('Connect With Me', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600).withEpilogue),
                ]),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: socialLinks.map((link) {
                    return GestureDetector(
                      onTap: () => _launchUrl(link.url),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: _getSocialColor(link.platform).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: _getSocialColor(link.platform).withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            FaIcon(_getSocialIcon(link.platform), size: 14, color: _getSocialColor(link.platform)),
                            const SizedBox(width: 6),
                            Text(
                              link.platform.replaceFirst(link.platform[0], link.platform[0].toUpperCase()),
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: _getSocialColor(link.platform))
                                  .withEpilogue,
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        );
      }
    }

    return SliverList(delegate: SliverChildListDelegate(sliverContent));
  }
}
