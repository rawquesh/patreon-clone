import 'package:flutter/material.dart';
import 'package:patreon-clone/models/creator/creator_model.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
// import 'package:patreon-clone/backend/creator/my_creator_controller.dart';
import 'package:patreon-clone/backend/creator/my_creator_provider.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';

class CreatorCard extends StatefulWidget {
  final CreatorModel creator;

  const CreatorCard({super.key, required this.creator});

  @override
  State<CreatorCard> createState() => _CreatorCardState();
}

class _CreatorCardState extends State<CreatorCard> {
  // late MyCreatorController _myCreatorController;
  late MyCreatorProvider myCreatorProvider;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        context.pushNamed(
          Routes.creatorProfile,
          extra: {
            'creatorModel': widget.creator,
            'creatorUsername': widget.creator.username,
          },
        );
      },
      child: Container(
        width: 170,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CommonCachedNetworkImage(
                imageUrl: widget.creator.profilePicture,
                height: 120,
                width: 120,
                borderRadius: 12,
                fit: BoxFit.cover,
              ),
              const SizedBox(height: 12),
              Text(
                widget.creator.displayName,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ).withEpilogue,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Expanded(
                child: Text(
                  widget.creator.bio,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey[600],
                    height: 1,
                  ).withEpilogue,
                  textAlign: TextAlign.center,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
