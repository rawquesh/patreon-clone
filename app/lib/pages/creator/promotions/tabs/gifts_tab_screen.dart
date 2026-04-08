import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:patreon-clone/models/promotions/gift/gift_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/promotions/gifts/gifts_controller.dart';
import 'package:patreon-clone/backend/promotions/gifts/gifts_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';

class GiftTabScreen extends StatefulWidget {
  const GiftTabScreen({super.key});

  @override
  State<GiftTabScreen> createState() => _GiftTabScreenState();
}

class _GiftTabScreenState extends State<GiftTabScreen> with MySafeState {
  late GiftProvider _provider;
  late GiftController _controller;

  @override
  void initState() {
    super.initState();
    _provider = context.read<GiftProvider>();
    _controller = GiftController(provider: _provider);
    _controller.getGifts();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      body: Consumer<GiftProvider>(
        builder: (context, provider, _) {
          final list = provider.gifts.getList();
          if (provider.isLoading.get() && list.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          return list.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: list.length,
                  itemBuilder: (context, index) {
                    return _buildGiftCard(list[index]);
                  },
                );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context
              .pushNamed(
            Routes.addEditGift,
          )
              .then((value) {
            if (value != null) _controller.getGifts();
          });
        },
        backgroundColor: themeData.primaryColor,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(
          'Add Gift Code',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ).withEpilogue,
        ),
        extendedPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.card_giftcard_outlined,
            size: 48,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No gift codes yet',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ).withEpilogue,
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first gift code to get started',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[500],
            ).withEpilogue,
          ),
        ],
      ),
    );
  }

  Widget _buildGiftCard(GiftModel gift) {
    final isExpiringSoon = gift.endDate.difference(DateTime.now()).inDays <= 7;
    const isActive = true; // Assuming all gifts are active for now

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => _showGiftDetails(gift),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          gift.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ).withEpilogue,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          gift.code,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                            fontWeight: FontWeight.w500,
                          ).withEpilogue,
                        ),
                      ],
                    ),
                  ),
                  _buildGiftBadge(gift),
                  const SizedBox(width: 8),
                  _buildStatusBadge(isActive, isExpiringSoon),
                ],
              ),

              const SizedBox(height: 12),

              // Description
              Text(
                gift.description,
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey[700],
                  height: 1.3,
                ).withEpilogue,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 10),

              // Info Row
              Row(
                children: [
                  _buildInfoChip(
                    Icons.calendar_today,
                    'Ends ${_formatDate(gift.endDate)}',
                    isExpiringSoon ? Colors.orange[100]! : Colors.grey[100]!,
                    isExpiringSoon ? Colors.orange[700]! : Colors.grey[600]!,
                  ),
                  const SizedBox(width: 8),
                  _buildInfoChip(
                    Icons.group,
                    gift.applicableTo,
                    themeData.primaryColor.withValues(alpha: 0.1),
                    themeData.primaryColor.withValues(alpha: 0.7),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // Bottom Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Redeemed: ${gift.redeemed.toInt()}',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ).withEpilogue,
                  ),
                  Row(
                    children: [
                      _buildActionButton(
                        Icons.edit,
                        'Edit',
                        themeData.primaryColor.withValues(alpha: 0.6),
                        () => _editGift(gift),
                      ),
                      const SizedBox(width: 8),
                      _buildActionButton(
                        Icons.more_vert,
                        'More',
                        Colors.grey[600]!,
                        () => _showMoreOptions(gift),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGiftBadge(GiftModel gift) {
    String badgeText = '';

    if (gift.giftType.toLowerCase() == 'membership') {
      badgeText = 'FREE ACCESS';
    } else if (gift.giftType.toLowerCase() == 'trial') {
      badgeText = '${gift.durationDays.toInt()} DAYS FREE';
    } else {
      badgeText = 'GIFT';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: themeData.primaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: themeData.primaryColor),
      ),
      child: Text(
        badgeText,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: themeData.primaryColor,
        ).withEpilogue,
      ),
    );
  }

  Widget _buildStatusBadge(bool isActive, bool isExpiringSoon) {
    String text = isActive ? 'Active' : 'Inactive';

    if (isExpiringSoon && isActive) {
      text = 'Expired';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: themeData.primaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w600,
          color: themeData.primaryColor,
        ).withEpilogue,
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text, Color bgColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: textColor),
          const SizedBox(width: 3),
          Text(
            text,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w500,
              color: textColor,
            ).withEpilogue,
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String tooltip, Color color, VoidCallback onPressed) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.all(4),
        child: Icon(
          icon,
          size: 16,
          color: color,
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return DateFormat('MMM d, y').format(date);
  }

  void _showGiftDetails(GiftModel gift) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => _buildGiftDetailsSheet(gift),
    );
  }

  Widget _buildGiftDetailsSheet(GiftModel gift) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Expanded(
                child: Text(
                  gift.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ).withEpilogue,
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Details
          _buildDetailRow('Code', gift.code),
          _buildDetailRow('Gift Type', gift.giftType.toUpperCase()),
          _buildDetailRow('Duration', '${gift.durationDays.toInt()} days'),
          _buildDetailRow('Start Date', _formatDate(gift.startDate)),
          _buildDetailRow('End Date', _formatDate(gift.endDate)),
          _buildDetailRow('Redeemed', '${gift.redeemed.toInt()} times'),
          _buildDetailRow('Public', gift.isPublic ? 'Yes' : 'No'),

          const SizedBox(height: 12),

          Text(
            'Applicable Tiers',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ).withEpilogue,
          ),
          const SizedBox(height: 4),
          Wrap(
            spacing: 6,
            children: gift.applicableTiers
                .map(
                  (tierMap) => Chip(
                    label: Text(
                      tierMap["name"] ?? '', // ✅ safely fetch name
                      style: const TextStyle(fontSize: 10).withEpilogue,
                    ),
                    backgroundColor: themeData.primaryColor.withValues(alpha: 0.1),
                    side: BorderSide(color: themeData.primaryColor.withValues(alpha: 200)),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _editGift(gift);
                  },
                  child: Text(
                    'Edit',
                    style: const TextStyle().withEpilogue,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _copyCode(gift.code);
                  },
                  child: Text(
                    'Copy Code',
                    style: const TextStyle().withEpilogue,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ).withEpilogue,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ).withEpilogue,
            ),
          ),
        ],
      ),
    );
  }

  void _editGift(GiftModel gift) {
    context
        .pushNamed(
      Routes.addEditGift,
      extra: gift,
    )
        .then((value) {
      if (value != null) _controller.getGifts();
    });
  }

  void _showMoreOptions(GiftModel gift) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.delete, color: Colors.red),
            title: Text(
              'Delete',
              style: const TextStyle(color: Colors.red).withEpilogue,
            ),
            onTap: () {
              Navigator.pop(context);
              _deleteGift(gift);
            },
          ),
        ],
      ),
    );
  }

  void _copyCode(String code) {
    // Implement copy to clipboard
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Code "$code" copied to clipboard',
          style: const TextStyle().withEpilogue,
        ),
      ),
    );
  }

  void _deleteGift(GiftModel gifts) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Gifts'),
        content: const Text('Are you sure you want to delete this Gift?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await _controller.deleteGift(gifts.id, context);
            },
            child: Text('Delete', style: const TextStyle(color: Colors.red).withEpilogue),
          ),
        ],
      ),
    );
  }
}
