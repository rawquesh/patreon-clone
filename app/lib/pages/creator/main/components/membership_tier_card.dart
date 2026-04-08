import 'package:flutter/material.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/styles/font_manager.dart';

import '../dialogs/add_membership_dialog.dart';

class MembershipTierCard extends StatefulWidget {
  final MembershipModel membership;

  const MembershipTierCard({super.key, required this.membership});

  @override
  State<MembershipTierCard> createState() => _MembershipTierCardState();
}

class _MembershipTierCardState extends State<MembershipTierCard> with MySafeState {
  void _editTier() {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) {
        return AddMembershipDialog(membership: widget.membership);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Stack(
      children: [
        Container(
          margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              CommonCachedNetworkImage(
                imageUrl: widget.membership.coverImage,
                height: 100,
                width: 100,
                borderRadius: 12,
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.membership.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '\$${widget.membership.monthlyRate.toStringAsFixed(0)} / month',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${widget.membership.subscriberCount} members',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(maxHeight: 10, maxWidth: 10),
                icon: Icon(
                  Icons.edit,
                  size: 24,
                  color: themeData.primaryColor,
                ),
                onPressed: _editTier,
                tooltip: 'Edit Tier',
              ),
            ],
          ),
        ),
        Positioned(
          top: 7,
          right: 17,
          child: Row(
            children: [
              if (widget.membership.isFeatured)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  decoration: BoxDecoration(
                    color: themeData.primaryColor,
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(10),
                      bottomLeft: Radius.circular(10),
                    ),
                  ),
                  child: Text(
                    'FEATURED',
                    style: const TextStyle(
                      fontSize: 8,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ).withEpilogue,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
