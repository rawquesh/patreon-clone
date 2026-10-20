import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/pages/user/post/components/html_viewer.dart';
import 'package:patreon_clone/pages/user/post/components/like_share.dart';
import 'package:patreon_clone/pages/user/post/components/post_tags.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:patreon_clone/pages/user/home/components/username_widget.dart';

class TextPostCard extends StatelessWidget {
  final PostModel post;
  final bool isShowUsername;

  const TextPostCard({
    super.key,
    required this.post,
    this.isShowUsername = true,
  });

  String _getTierNames(List<MembershipModel> tiers) {
    if (tiers.isEmpty) return '';
    return tiers.map((tier) => tier.name).join(' or ');
  }

  Widget _buildLockOverlay(BuildContext context) {
    String tierNames = _getTierNames(post.requiredTiers);

    return Positioned.fill(
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
          child: GestureDetector(
            onTap: () {
              // Navigate to the creator's membership page
              if (post.creator != null) {}
            },
            child: Container(
              alignment: Alignment.center,
              color: Colors.black.withOpacity(0.5),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.lock_outline,
                      color: Colors.white,
                      size: 40.0,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Join the $tierNames membership to unlock',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isLocked = post.requiredTiers.isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isShowUsername) ...[
          UsernameWidget(post: post),
        ],
        Stack(
          alignment: Alignment.center,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  child: Text(
                    post.title,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold).withTiempos,
                  ),
                ),
                MyHTMLViewer(post: post),
              ],
            ),
            if (isLocked) _buildLockOverlay(context),
          ],
        ),
        // Only show tags, likes, and comments if the post is not locked
        if (!isLocked) ...[
          PostTagsWidget(post: post),
          MyLikeCommentShareWidget(post: post),
        ],
      ],
    );
  }
}
