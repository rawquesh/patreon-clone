import 'package:flutter/material.dart';
import 'package:patreon-clone/models/creator/creator_model.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/utils/datetime.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';

class UsernameWidget extends StatelessWidget {
  final PostModel post;

  const UsernameWidget({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    final String creatorProfilePic = post.creator?.profilePicture ?? "";
    final String creatorDisplayName = post.creator?.displayName ?? "Unknown Creator";
    final String creatorUsername = post.creator?.username ?? "unknown_user";

    return Padding(
      padding: const EdgeInsets.all(8.0).copyWith(right: 15),
      child: InkWell(
        onTap: () {
          final creatorModel = post.creator ??
              CreatorModel(
                id: post.creatorId,
                displayName: creatorDisplayName,
                profilePicture: creatorProfilePic,
                username: creatorUsername,
              );

          context.pushNamed(
            Routes.creatorProfile,
            extra: {
              'creatorModel': creatorModel,
              'creatorUsername': creatorUsername,
            },
          );
        },
        child: Row(
          children: [
            CommonCachedNetworkImage(
              imageUrl: creatorProfilePic,
              width: 40,
              height: 40,
              borderRadius: 12,
              fit: BoxFit.cover,
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  creatorDisplayName,
                  style: const TextStyle(fontWeight: FontWeight.w600).withEpilogue,
                ),
                Text(
                  "@$creatorUsername",
                  style: const TextStyle(color: Colors.grey, fontSize: 12).withEpilogue,
                ),
              ],
            ),
            const Spacer(),
            Text(
              MyDateFormat.getTimeAgo(post.createdAt),
              style: const TextStyle(color: Colors.grey, fontSize: 12).withEpilogue,
            ),
          ],
        ),
      ),
    );
  }
}
