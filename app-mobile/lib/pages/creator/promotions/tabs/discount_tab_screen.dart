import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:patreon_clone/models/promotions/discount/discount_model.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/utils/my_toast.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon_clone/backend/promotions/discount_controller.dart';
import 'package:patreon_clone/backend/promotions/discount_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';

class DiscountTabScreen extends StatefulWidget {
  const DiscountTabScreen({super.key});

  @override
  State<DiscountTabScreen> createState() => _DiscountTabScreenState();
}

class _DiscountTabScreenState extends State<DiscountTabScreen> with MySafeState {
  List<DiscountModel> discounts = [];
  late DiscountProvider _provider;
  late DiscountController _controller;

  @override
  void initState() {
    super.initState();
    _provider = context.read<DiscountProvider>();
    _controller = DiscountController(provider: _provider);
    _controller.getDiscounts();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      body: Consumer<DiscountProvider>(
        builder: (context, provider, _) {
          final discounts = provider.discounts.getList();
          if (provider.isLoading.get() && discounts.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          return discounts.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: discounts.length,
                  itemBuilder: (context, index) {
                    return _buildDiscountCard(discounts[index]);
                  },
                );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context
              .pushNamed(
            Routes.addEditDiscount,
          )
              .then((value) {
            if (value != null) _controller.getDiscounts();
          });
        },
        backgroundColor: themeData.primaryColor,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(
          'Add Discount',
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
            Icons.discount_outlined,
            size: 48,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No discount codes yet',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ).withEpilogue,
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first discount code to get started',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[500],
            ).withEpilogue,
          ),
        ],
      ),
    );
  }

  Widget _buildDiscountCard(DiscountModel discount) {
    final isExpiringSoon = discount.endDate.difference(DateTime.now()).inDays <= 7;
    final isActive = discount.status.toLowerCase() == 'active';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.09),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => _showDiscountDetails(discount),
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
                          discount.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ).withEpilogue,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          discount.code,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                            fontWeight: FontWeight.w500,
                          ).withEpilogue,
                        ),
                      ],
                    ),
                  ),
                  _buildDiscountBadge(discount),
                  const SizedBox(width: 8),
                  _buildStatusBadge(isActive, isExpiringSoon),
                ],
              ),

              const SizedBox(height: 12),

              // Description
              Text(
                discount.description,
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
                    'Ends ${_formatDate(discount.endDate)}',
                    isExpiringSoon ? Colors.orange[100]! : Colors.grey[100]!,
                    isExpiringSoon ? Colors.orange[700]! : Colors.grey[600]!,
                  ),
                  const SizedBox(width: 8),
                  _buildInfoChip(
                    Icons.group,
                    discount.applicableTo,
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
                    'Redeemed: ${discount.redeemed.toInt()}',
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
                        () => _editDiscount(discount),
                      ),
                      const SizedBox(width: 8),
                      _buildActionButton(
                        Icons.more_vert,
                        'More',
                        Colors.grey[600]!,
                        () => _showMoreOptions(discount),
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

  Widget _buildDiscountBadge(DiscountModel discount) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.green[50],
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.green[200]!),
      ),
      child: Text(
        '${discount.discountNumber.toInt()}${discount.percentageType == 'percentage' ? '%' : ''} OFF',
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: Colors.green[700],
        ).withEpilogue,
      ),
    );
  }

  Widget _buildStatusBadge(bool isActive, bool isExpiringSoon) {
    String text = isActive ? 'Active' : 'Inactive';

    if (isExpiringSoon && isActive) {
      text = 'Expiring';
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
          color: themeData.primaryColor.withValues(alpha: 0.8),
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

  void _showDiscountDetails(DiscountModel discount) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => _buildDiscountDetailsSheet(discount),
    );
  }

  Widget _buildDiscountDetailsSheet(DiscountModel discount) {
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
                  discount.title,
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
          _buildDetailRow('Code', discount.code),
          _buildDetailRow('Discount', '${discount.discountNumber.toInt()}${discount.percentageType == 'percentage' ? '%' : ''}'),
          _buildDetailRow('Status', discount.status),
          _buildDetailRow('Start Date', _formatDate(discount.startDate)),
          _buildDetailRow('End Date', _formatDate(discount.endDate)),
          _buildDetailRow('Redeemed', '${discount.redeemed.toInt()} times'),

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
            children: discount.applicableTiers
                .map(
                  (tierMap) => Chip(
                    label: Text(
                      tierMap["name"] ?? '', // ✅ safely fetch name
                      style: const TextStyle(fontSize: 10).withEpilogue,
                    ),
                    backgroundColor: themeData.primaryColor.withValues(alpha: 0.1),
                    side: BorderSide(color: themeData.primaryColor.withValues(alpha: 0.2)),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 20),

          // Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _editDiscount(discount);
                  },
                  child: const Text('Edit'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _copyCode(discount.code);
                  },
                  child: const Text('Copy Code'),
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

  void _editDiscount(DiscountModel discount) {
    context
        .pushNamed(
      Routes.addEditDiscount,
      extra: discount,
    )
        .then((value) {
      if (value != null) _controller.getDiscounts();
    });
  }

  void _showMoreOptions(DiscountModel discount) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.copy),
            title: const Text('Copy Code'),
            onTap: () {
              Navigator.pop(context);
              _copyCode(discount.code);
            },
          ),
          ListTile(
            leading: const Icon(Icons.delete, color: Colors.red),
            title: Text('Delete', style: const TextStyle(color: Colors.red).withEpilogue),
            onTap: () {
              Navigator.pop(context);
              _deleteDiscount(discount);
            },
          ),
        ],
      ),
    );
  }

  void _copyCode(String code) {
    MyToast.showSuccess(context: context, msg: 'Code "$code" copied to clipboard');
  }

  void _deleteDiscount(DiscountModel discount) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Discount'),
        content: const Text('Are you sure you want to delete this discount code?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await _controller.deleteDiscount(discount.id, context);
            },
            child: Text('Delete', style: const TextStyle(color: Colors.red).withEpilogue),
          ),
        ],
      ),
    );
  }
}
