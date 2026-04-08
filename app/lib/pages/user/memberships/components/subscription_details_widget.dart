import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:patreon-clone/models/subscription/subscription_model.dart';
import 'package:patreon-clone/styles/font_manager.dart';
// import 'package:provider/provider.dart';

// import '../../../backend/memberships/membership_controller.dart';
// import '../../../backend/memberships/membership_provider.dart';
// import '../../creator/screens/join_membership_screen.dart';

class SubscriptionDetailsWidget extends StatelessWidget {
  final SubscriptionModel subscription;
  final String creatorId;

  const SubscriptionDetailsWidget({
    super.key,
    required this.subscription,
    required this.creatorId,
  });

  @override
  Widget build(BuildContext context) {
    final themeData = Theme.of(context);
    final dateFormat = DateFormat('MMM d, yyyy');
    final planName = subscription.membership?.name ?? 'Membership';

    return Container(
      margin: const EdgeInsets.only(bottom: 20, top: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: themeData.primaryColor.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: themeData.primaryColor.withValues(alpha: 0.15),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Celebrate current plan
          Row(
            children: [
              Icon(
                Icons.workspace_premium_rounded,
                size: 16,
                color: themeData.primaryColor,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  "You're on $planName — enjoy the perks! 🎉",
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                    height: 1.3,
                  ).withEpilogue,
                ),
              ),
              /*// Manage/Upgrade CTA
              GestureDetector(
                onTap: () => _onManageSubscription(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: themeData.primaryColor,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Upgrade',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ).withEpilogue,
                  ),
                ),
              ),*/
            ],
          ),
          const SizedBox(height: 6),
          // Member since (no expiry)
          Text(
            'Member since: ${dateFormat.format(subscription.createdAt)}',
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey.shade600,
              fontWeight: FontWeight.w400,
            ).withEpilogue,
          ),
        ],
      ),
    );
  }

  // void _onManageSubscription(BuildContext context) async {
  //   final membershipProvider = context.read<MembershipProvider>();
  //   final membershipController = MembershipController(provider: membershipProvider);
  //   final checkoutUrl = await membershipController.createCheckout(subscription.membership!.id);
  //   if (checkoutUrl != null) {
  //     Navigator.push(
  //       context,
  //       MaterialPageRoute(
  //         builder: (context) => JoinMembershipScreen(
  //           membershipId: subscription.membership!.id,
  //           creatorId: creatorId,
  //         ),
  //       ),
  //     );
  //   }
  // }
}
