import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:patreon_clone/config/index.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:patreon_clone/backend/post/liked_posts_controller.dart';
import 'package:patreon_clone/backend/post/liked_posts_provider.dart';
import 'package:patreon_clone/backend/post/my_post_controller.dart';
import 'package:patreon_clone/backend/post/post_provider.dart';
import 'package:patreon_clone/pages/user/home/components/animated_heart_button.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'report_post_dialog.dart';

class MyLikeCommentShareWidget extends StatefulWidget {
  final PostModel post;

  const MyLikeCommentShareWidget({
    super.key,
    required this.post,
  });

  @override
  State<MyLikeCommentShareWidget> createState() => _MyLikeCommentShareWidgetState();
}

class _MyLikeCommentShareWidgetState extends State<MyLikeCommentShareWidget> with MySafeState {
  bool _isLiked = false;
  late int _likesCount;
  late LikedPostsController likedPostsController;
  late LikedPostsProvider likedPostsProvider;
  late PostProvider postProvider;
  late MyPostController myPostController;

  @override
  void initState() {
    super.initState();
    _likesCount = widget.post.likeCount;

    // Initialize providers and controllers from context
    postProvider = context.read<PostProvider>();
    myPostController = MyPostController(postProvider: postProvider);
    likedPostsProvider = context.read<LikedPostsProvider>();
    likedPostsController = LikedPostsController(
      likedPostsProvider: likedPostsProvider,
      myPostController: myPostController,
    );

    // Set initial like count from provider if available, otherwise use post data
    int? existingCount = likedPostsProvider.likeCounts.getMap(isNewInstance: false)[widget.post.id];
    if (existingCount != null) {
      _likesCount = existingCount;
    } else {
      likedPostsProvider.likeCounts.setMap(map: {widget.post.id: _likesCount}, isClear: false, isNotify: false);
    }

    _loadInitialLike();
  }

  Future<void> _loadInitialLike() async {
    bool liked = await likedPostsController.getLikeStatus(widget.post.id);
    if (mounted) {
      setState(() {
        _isLiked = liked;
      });
    }
  }

  Future<void> _toggleLike() async {
    // Optimistic UI update
    bool wasLiked = context.read<LikedPostsProvider>().likedPosts.getMap(isNewInstance: false)[widget.post.id] ?? false;
    bool newLiked = !wasLiked;

    context.read<LikedPostsProvider>().likedPosts.setMap(map: {widget.post.id: newLiked}, isClear: false);
    int originalCount = context.read<LikedPostsProvider>().likeCounts.getMap(isNewInstance: false)[widget.post.id] ?? _likesCount;
    int newCount = originalCount + (newLiked ? 1 : -1);
    context.read<LikedPostsProvider>().likeCounts.setMap(map: {widget.post.id: newCount}, isClear: false);

    setState(() {
      _likesCount = newCount;
      _isLiked = newLiked;
    });

    // API call
    final result = await likedPostsController.toggleLike(widget.post.id);

    // Revert if API call fails
    if (!result['success'] && mounted) {
      context.read<LikedPostsProvider>().likedPosts.setMap(map: {widget.post.id: wasLiked}, isClear: false);
      context.read<LikedPostsProvider>().likeCounts.setMap(map: {widget.post.id: originalCount}, isClear: false);
      setState(() {
        _likesCount = originalCount;
        _isLiked = wasLiked;
      });
    } else {
      widget.post.likeCount = _likesCount;
    }
  }

  void _sharePost() {
    final shareText = AppConfig.postShareUrl(widget.post.id);

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.grey[100],
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Share Post',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ).withEpilogue,
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 20,
                runSpacing: 20,
                alignment: WrapAlignment.center,
                children: [
                  _buildExternalAppButton(
                    icon: FontAwesomeIcons.xTwitter,
                    label: 'Twitter',
                    shareUrl: '${AppConfig.twitterShareBase}?text=${Uri.encodeComponent(shareText)}',
                    notInstalledMessage: 'Twitter is not installed.',
                  ),
                  _buildExternalAppButton(
                    icon: FontAwesomeIcons.facebookF,
                    label: 'Facebook',
                    shareUrl: '${AppConfig.facebookShareBase}?u=${Uri.encodeComponent(shareText)}',
                    notInstalledMessage: 'Facebook is not installed.',
                  ),
                  _buildExternalAppButton(
                    icon: FontAwesomeIcons.whatsapp,
                    label: 'WhatsApp',
                    shareUrl: '${AppConfig.whatsappShareBase}://send?text=${Uri.encodeComponent(shareText)}',
                    notInstalledMessage: 'WhatsApp is not installed.',
                  ),
                  _buildShareButton(
                    icon: Icons.link,
                    label: 'Link',
                    onTap: () async {
                      Navigator.pop(context);
                      await Clipboard.setData(ClipboardData(text: shareText));
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Link copied to clipboard!')),
                        );
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildExternalAppButton({
    required IconData icon,
    required String label,
    required String shareUrl,
    required String notInstalledMessage,
  }) {
    return _buildShareButton(
      icon: icon,
      label: label,
      onTap: () async {
        Navigator.pop(context);
        final Uri url = Uri.parse(shareUrl);
        if (await canLaunchUrl(url)) {
          await launchUrl(url, mode: LaunchMode.inAppBrowserView);
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(notInstalledMessage)),
            );
          }
        }
      },
    );
  }

  Widget _buildShareButton({required IconData icon, required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 32, color: Colors.black87),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 12).withEpilogue),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    final themeData = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Consumer<LikedPostsProvider>(
                builder: (context, provider, _) {
                  final isLiked = provider.likedPosts.getMap(isNewInstance: false)[widget.post.id] ?? _isLiked;
                  final likesCount = provider.likeCounts.getMap(isNewInstance: false)[widget.post.id] ?? _likesCount;

                  return AnimatedHeartButton(
                    isLiked: isLiked,
                    likesCount: likesCount,
                    onTap: _toggleLike,
                    size: 26,
                    likedColor: Colors.red,
                    unlikedColor: Colors.grey,
                    showCount: true,
                    countTextStyle: const TextStyle(fontSize: 14, color: Colors.grey).withEpilogue,
                  );
                },
              ),
              const SizedBox(width: 16),
              const Icon(CupertinoIcons.chat_bubble, size: 26, color: Colors.grey),
              const SizedBox(width: 4),
              Text(
                "${widget.post.commentCount}",
                style: themeData.textTheme.labelMedium?.copyWith(
                  color: Colors.grey,
                ),
              ),
            ],
          ),
          Row(
            children: [
              GestureDetector(
                onTap: _sharePost,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Icon(
                      CupertinoIcons.share,
                      color: Colors.grey,
                      size: 18,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      "Share",
                      style: themeData.textTheme.labelMedium?.copyWith(color: Colors.grey).withEpilogue,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              PopupMenuButton<String>(
                icon: const Icon(
                  Icons.more_horiz,
                  color: Colors.grey,
                  size: 20,
                ),
                onSelected: (value) {
                  if (value == 'report') {
                    showDialog(
                      context: context,
                      builder: (context) => ReportPostDialog(postId: widget.post.id),
                    );
                  }
                },
                itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                  PopupMenuItem<String>(
                    value: 'report',
                    child: Row(
                      children: [
                        const Icon(Icons.report_gmailerrorred, size: 18, color: Colors.grey),
                        const SizedBox(width: 8),
                        Text(
                          'Report',
                          style: themeData.textTheme.labelMedium?.withEpilogue,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
