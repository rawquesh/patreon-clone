import 'package:flutter/material.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/models/subscription/subscription_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/backend/creator/my_creator_controller.dart';
import 'package:patreon-clone/backend/creator/my_creator_provider.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';

class MembershipSectionWidget extends StatefulWidget {
  final List<MembershipModel> memberships;
  final String creatorId;

  const MembershipSectionWidget({
    super.key,
    required this.memberships,
    required this.creatorId,
  });

  @override
  State<MembershipSectionWidget> createState() => _MembershipSectionWidgetState();
}

class _MembershipSectionWidgetState extends State<MembershipSectionWidget> with MySafeState {
  late MyCreatorProvider myCreatorProvider;
  late MyCreatorController myCreatorController;

  @override
  void initState() {
    super.initState();
    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(myCreatorProvider: myCreatorProvider);
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    if (widget.memberships.isEmpty) {
      return const Center(child: LoadingWidget());
    }

    List<SubscriptionModel> subscriptions = myCreatorProvider.userSubscriptionsPaginationModel.get().contentsList.getList();

    final List<MembershipModel> paidMemberships = widget.memberships.where((m) => !m.isFree).toList();

    if (paidMemberships.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Choose your Membership',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ).withEpilogue,
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 340,
          child: ListView.builder(
            shrinkWrap: true,
            scrollDirection: Axis.horizontal,
            itemCount: paidMemberships.length,
            itemBuilder: (context, index) {
              final tier = paidMemberships[index];
              return Container(
                width: 220,
                margin: const EdgeInsets.only(right: 16, top: 8, bottom: 8, left: 8),
                child: Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: double.infinity,
                        height: 145,
                        decoration: BoxDecoration(
                          color: themeData.colorScheme.onPrimary,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(15),
                            topRight: Radius.circular(15),
                          ),
                        ),
                        child: tier.coverImage.isNotEmpty
                            ? CommonCachedNetworkImage(
                                imageUrl: tier.coverImage,
                                fit: BoxFit.cover,
                              )
                            : Icon(
                                Icons.group,
                                size: 50,
                                color: themeData.primaryColor,
                              ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              tier.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                            const SizedBox(height: 8),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: tier.monthlyPrice == 0 ? 'Free' : '\$${tier.monthlyPrice.toInt()}',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black,
                                    ),
                                  ),
                                  if (tier.monthlyPrice > 0)
                                    const TextSpan(
                                      text: '/month',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              height: 40,
                              width: double.infinity,
                              child: Builder(builder: (context) {
                                bool isJoined = subscriptions
                                    .any((sub) => sub.membership?.id == tier.id && sub.status.toLowerCase() == 'active');

                                return ElevatedButton(
                                  onPressed: isJoined
                                      ? null
                                      : () async {
                                          final result = await context.pushNamed<bool>(
                                            Routes.joinMembership,
                                            extra: {
                                              'membershipId': tier.id,
                                              'creatorId': widget.creatorId,
                                            },
                                          );

                                          if (result == true) {
                                            await myCreatorController.getUserSubscribedMembershipsPaginatedList(
                                              isRefresh: true,
                                              isFromCache: false,
                                              isNotify: true,
                                            );

                                            _showSubscriptionSuccessDialog(context);
                                          }
                                        },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: themeData.primaryColor,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: Text(
                                    isJoined ? 'Joined' : 'Join',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                );
                              }),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              tier.description,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  void _showSubscriptionSuccessDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            padding: const EdgeInsets.all(20),
            constraints: const BoxConstraints(maxWidth: 300),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Colors.white,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Success icon with circular background
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: Colors.green.shade100,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.check_circle,
                    color: Colors.green.shade600,
                    size: 28,
                  ),
                ),

                const SizedBox(height: 12),

                // Title
                Text(
                  'Welcome to the Patreon Clone!',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade800,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 8),

                // Subtitle
                Text(
                  'You\'re now a premium member!\nEnjoy exclusive content and perks.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 16),

                // Features row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildFeatureItem(Icons.play_circle_outline, 'Exclusive\nVideos'),
                    _buildFeatureItem(Icons.star_outline, 'Premium\nContent'),
                    _buildFeatureItem(Icons.chat_bubble_outline, 'Direct\nAccess'),
                  ],
                ),

                const SizedBox(height: 20),

                // Close button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).primaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text(
                      'Start Exploring',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

// Helper method for feature items
  Widget _buildFeatureItem(IconData icon, String label) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: themeData.primaryColor.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            size: 18,
            color: themeData.primaryColor.withValues(alpha: 0.6),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey.shade600,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
