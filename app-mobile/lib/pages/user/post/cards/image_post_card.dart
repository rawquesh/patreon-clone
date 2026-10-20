import 'package:flutter/material.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:patreon_clone/pages/user/post/components/html_viewer.dart';
import 'package:patreon_clone/pages/user/post/components/like_share.dart';
import 'package:patreon_clone/pages/user/post/components/post_tags.dart';
import 'package:patreon_clone/pages/user/home/components/username_widget.dart';

class ImagePostCard extends StatefulWidget {
  final PostModel post;
  final bool isShowUsername;

  const ImagePostCard({
    super.key,
    required this.post,
    this.isShowUsername = true,
  });

  @override
  State<ImagePostCard> createState() => _ImagePostCardState();
}

class _ImagePostCardState extends State<ImagePostCard> with AutomaticKeepAliveClientMixin {
  int _currentPage = 0; // State for image carousel

  Widget _buildMediaSection() {
    final mediaUrls = widget.post.mediaUrls;
    final themeData = Theme.of(context);

    // Case 1: Multiple images -> Display a carousel
    if (mediaUrls.length > 1) {
      return Column(
        children: [
          SizedBox(
            height: MediaQuery.of(context).size.width,
            width: double.infinity,
            child: PageView.builder(
              itemCount: mediaUrls.length,
              onPageChanged: (index) {
                setState(() {
                  _currentPage = index;
                });
              },
              itemBuilder: (context, index) {
                return CommonCachedNetworkImage(
                  imageUrl: mediaUrls[index],
                  fit: BoxFit.contain,
                  height: MediaQuery.of(context).size.width * 0.7,
                  width: MediaQuery.of(context).size.width,
                  onlyPlaceholderSize: true,
                );
              },
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(mediaUrls.length, (index) {
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
                height: 8,
                width: _currentPage == index ? 24 : 8,
                decoration: BoxDecoration(
                  color: _currentPage == index ? themeData.primaryColor : Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(4),
                ),
              );
            }),
          ),
        ],
      );
    }
    // Case 2: One image from mediaUrls
    else if (mediaUrls.isNotEmpty) {
      return SizedBox(
        width: double.infinity,
        child: CommonCachedNetworkImage(
          imageUrl: mediaUrls.first,
          fit: BoxFit.contain,
          height: MediaQuery.of(context).size.width * 0.7,
          width: MediaQuery.of(context).size.width,
          onlyPlaceholderSize: true,
        ),
      );
    }
    // Case 3: Fallback to thumbnail URL
    else {
      return SizedBox(
        width: double.infinity,
        child: CommonCachedNetworkImage(
          imageUrl: widget.post.thumbnailUrl,
          fit: BoxFit.contain,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Needed for AutomaticKeepAliveClientMixin

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.isShowUsername) ...[
          UsernameWidget(post: widget.post),
        ],
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (widget.post.title.isNotEmpty)
                Text(
                  widget.post.title,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold).withTiempos,
                ),
            ],
          ),
        ),
        _buildMediaSection(),
        MyHTMLViewer(post: widget.post),
        PostTagsWidget(post: widget.post),
        MyLikeCommentShareWidget(post: widget.post),
      ],
    );
  }

  @override
  bool get wantKeepAlive => true;
}
