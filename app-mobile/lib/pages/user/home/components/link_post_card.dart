import 'package:flutter/material.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/pages/user/post/components/link_preview_display.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/user/post/components/html_viewer.dart';
import 'package:patreon-clone/pages/user/post/components/like_share.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/pages/user/home/components/username_widget.dart';
import 'package:url_launcher/url_launcher.dart';

class LinkPostCard extends StatelessWidget {
  final PostModel post;
  final bool isShowUsername;

  const LinkPostCard({
    super.key,
    required this.post,
    this.isShowUsername = true,
  });

  Future<void> _launchURL() async {
    final url = post.linkUrl;
    if (url.isNotEmpty) {
      try {
        final Uri uri = Uri.parse(url);
        if (!await launchUrl(uri, mode: LaunchMode.inAppBrowserView)) {
          throw Exception('Could not launch $uri');
        }
      } catch (e) {
        MyPrint.printOnConsole('Error launching URL: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeData = Theme.of(context);
    var linkUrl2 = post.linkUrl;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isShowUsername) ...[
          UsernameWidget(post: post),
        ],
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (post.title.isNotEmpty)
                Text(
                  post.title,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold).withTiempos,
                ),
            ],
          ),
        ),
        // Link container
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8).copyWith(bottom: 0),
          child: LinkPreviewDisplay(linkUrl: linkUrl2),
        ),
        InkWell(
          onTap: _launchURL,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 10),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: themeData.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: themeData.primaryColor.withOpacity(0.2), width: 1),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.link,
                  color: themeData.primaryColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    linkUrl2.isEmpty ? "No link available" : linkUrl2,
                    style: TextStyle(
                      color: themeData.primaryColor,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ).withEpilogue,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
        MyHTMLViewer(post: post),
        MyLikeCommentShareWidget(post: post),
      ],
    );
  }
}
