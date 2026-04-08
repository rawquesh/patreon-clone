import 'package:flutter/material.dart';
import 'package:patreon-clone/models/creator/creator_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/creator/my_creator_controller.dart';
import 'package:patreon-clone/backend/creator/my_creator_provider.dart';

class CreatorHorizontalCard extends StatefulWidget {
  final CreatorModel creator;

  const CreatorHorizontalCard({super.key, required this.creator});

  @override
  State<CreatorHorizontalCard> createState() => _CreatorHorizontalCardState();
}

class _CreatorHorizontalCardState extends State<CreatorHorizontalCard> with MySafeState {
  late MyCreatorProvider myCreatorProvider;
  late MyCreatorController myCreatorController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(myCreatorProvider: myCreatorProvider);
  }

  bool _isCreatorSubscribed(MyCreatorProvider provider) {
    final subscriptions = provider.userSubscriptionsPaginationModel.get().contentsList.getList();
    return subscriptions.any((sub) => sub.creator?.id == widget.creator.id && sub.status.toLowerCase() == 'active');
  }

  void _handleJoinPressed() async {
    setState(() {
      _isLoading = true;
    });

    try {
      Map<String, dynamic> result = await myCreatorController.joinCreatorFree(
        creatorId: widget.creator.id,
      );

      if (result['success'] == true) {
        await myCreatorController.getUserSubscribedMembershipsPaginatedList(
          isRefresh: true,
          isFromCache: false,
          isNotify: true,
        );
        if (mounted) {
          MyToast.showSuccess(context: context, msg: result['message'] ?? 'You are now a free member');
        }
      } else {
        if (mounted) {
          MyToast.showError(
            context: context,
            msg: result['message'] ?? 'Failed to join',
          );
        }
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    ThemeData themeData = Theme.of(context);
    return ModalProgressHUD(
      inAsyncCall: _isLoading,
      child: Consumer<MyCreatorProvider>(
        builder: (context, provider, child) {
          bool isSubscribed = _isCreatorSubscribed(provider);

          return Container(
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
              padding: const EdgeInsets.all(12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CommonCachedNetworkImage(
                    imageUrl: widget.creator.profilePicture,
                    height: 90,
                    width: 90,
                    borderRadius: 12,
                    fit: BoxFit.cover,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              widget.creator.displayName,
                              style: themeData.textTheme.labelMedium?.copyWith(
                                color: themeData.colorScheme.onSurface,
                                fontWeight: FontWeight.bold,
                              ),
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                            ),
                            const SizedBox(width: 8),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: themeData.primaryColor.withAlpha(50),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            widget.creator.category,
                            style: themeData.textTheme.labelSmall
                                ?.copyWith(
                                  color: themeData.primaryColor,
                                  fontSize: 9,
                                )
                                .withEpilogue,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          widget.creator.bio,
                          style: themeData.textTheme.labelSmall?.copyWith(color: Colors.grey).withEpilogue,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            InkWell(
                              onTap: (isSubscribed || _isLoading) ? null : _handleJoinPressed,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isSubscribed ? Colors.grey : themeData.primaryColor,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: _isLoading
                                    ? const SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                        ),
                                      )
                                    : Text(
                                        isSubscribed ? 'Joined' : 'Join For Free',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 10,
                                        ).withEpilogue,
                                      ),
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
