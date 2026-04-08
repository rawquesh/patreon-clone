import 'package:flutter/material.dart';
import 'package:patreon-clone/models/subscription/subscription_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/memberships/membership_controller.dart';
import 'package:patreon-clone/backend/memberships/membership_provider.dart';
import 'package:patreon-clone/pages/components/common/common_confirmation_dialog.dart';

class MembershipCard extends StatefulWidget {
  final SubscriptionModel subscription;
  final VoidCallback onUnsubscribe;

  const MembershipCard({
    super.key,
    required this.subscription,
    required this.onUnsubscribe,
  });

  @override
  State<MembershipCard> createState() => _MembershipCardState();
}

class _MembershipCardState extends State<MembershipCard> with MySafeState {
  late MembershipController _membershipController;

  @override
  void initState() {
    super.initState();
    final membershipProvider = context.read<MembershipProvider>();
    _membershipController = MembershipController(provider: membershipProvider);
  }

  void _showUnsubscribeConfirmation() {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return CommonConfirmationDialog(
          title: 'Unsubscribe',
          description: 'Are you sure you want to unsubscribe from ${widget.subscription.creator?.displayName ?? 'this creator'}?',
          confirmationText: 'Unsubscribe',
          onConfirmTap: () async {
            Navigator.of(dialogContext).pop(); // Close the dialog
            final result = await _membershipController.unsubscribeFromCreator(widget.subscription.creator!.id);

            if (mounted) {
              if (result != null && result['success'] == true) {
                MyToast.showSuccess(context: context, msg: result['message'] ?? 'Successfully unsubscribed.');
                widget.onUnsubscribe();
              } else {
                MyPrint.printOnConsole("Unsubscribe failed: $result");
                MyToast.showError(context: context, msg: result?['message'] ?? 'Failed to unsubscribe.');
              }
            }
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 1),
            spreadRadius: 0,
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CommonCachedNetworkImage(
                  imageUrl: widget.subscription.creator?.profilePicture ?? "",
                  width: 45,
                  height: 45,
                  fit: BoxFit.cover,
                  borderRadius: 30,
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.subscription.creator?.displayName ?? "",
                        style: themeData.textTheme.labelLarge
                            ?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: themeData.colorScheme.onSurface,
                              fontSize: 16,
                            )
                            .withEpilogue,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '@${widget.subscription.creator?.username ?? ""}',
                        style: themeData.textTheme.labelSmall
                            ?.copyWith(
                              fontWeight: FontWeight.normal,
                              color: themeData.colorScheme.onSurface.withValues(alpha: 0.7),
                              fontSize: 12,
                            )
                            .withEpilogue,
                      ),
                    ],
                  ),
                ),
                _buildMembershipBadge(),
                IconButton(
                  icon: const Icon(Icons.more_vert),
                  onPressed: _showUnsubscribeConfirmation,
                )
              ],
            ),
            if (widget.subscription.monthlyRate > 0) ...[
              const SizedBox(height: 15),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!, width: 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Text(
                                widget.subscription.membership?.name ?? "",
                                style: themeData.textTheme.labelLarge
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: themeData.colorScheme.onSurface,
                                      fontSize: 16,
                                    )
                                    .withEpilogue,
                                maxLines: 1,
                              ),
                              Container(
                                margin: const EdgeInsets.symmetric(horizontal: 8),
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: themeData.primaryColor.withValues(alpha: 0.7),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              _buildPriceDisplay(),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildBenefitsList(),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBenefitsList() {
    final benefits = widget.subscription.membership?.benefits ?? [];

    if (benefits.isEmpty) {
      return Text(
        widget.subscription.membership?.description ?? "",
        style: TextStyle(
          fontSize: 14,
          color: Colors.grey[700],
          height: 1.4,
        ),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'What\'s Included',
          style: themeData.textTheme.labelMedium
              ?.copyWith(
                fontWeight: FontWeight.w600,
                color: themeData.colorScheme.onSurface,
                fontSize: 13,
              )
              .withEpilogue,
        ),
        const SizedBox(height: 8),
        ...benefits.take(3).map((benefit) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    margin: const EdgeInsets.only(top: 6, right: 8),
                    width: 4,
                    height: 4,
                    decoration: BoxDecoration(
                      color: themeData.primaryColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      benefit,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[700],
                        height: 1.3,
                      ).withEpilogue,
                    ),
                  ),
                ],
              ),
            )),
        if (benefits.length > 3)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              '+${benefits.length - 3} more benefits',
              style: TextStyle(
                fontSize: 12,
                color: themeData.primaryColor,
                fontWeight: FontWeight.w500,
              ).withEpilogue,
            ),
          ),
      ],
    );
  }

  Widget _buildMembershipBadge() {
    final bool isFree = widget.subscription.monthlyRate == 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isFree ? [Colors.green[400]!, Colors.green[600]!] : [Colors.blue[400]!, Colors.blue[600]!],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        isFree ? 'FREE' : 'PREMIUM',
        style: themeData.textTheme.labelSmall
            ?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
              fontSize: 8,
              letterSpacing: 0.7,
            )
            .withEpilogue,
      ),
    );
  }

  Widget _buildPriceDisplay() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: themeData.primaryColor.withValues(alpha: 0.3), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: RichText(
        textAlign: TextAlign.end,
        text: TextSpan(
          children: [
            TextSpan(
              text: '\$${widget.subscription.monthlyRate.toStringAsFixed(0)}',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: themeData.primaryColor,
              ),
            ),
            TextSpan(
              text: '/mo',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: themeData.primaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
