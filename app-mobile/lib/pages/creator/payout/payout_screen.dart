import 'package:flutter/material.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/payout/payout_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon_clone/backend/payout/payout_controller.dart';
import 'package:patreon_clone/backend/payout/payout_provider.dart';

class PayoutBalance {
  final double availableToWithdraw;
  final double pendingWeb;
  final double pendingIos;
  final List<RecentPayout> recentPayouts;

  PayoutBalance({
    required this.availableToWithdraw,
    required this.pendingWeb,
    required this.pendingIos,
    required this.recentPayouts,
  });

  double get totalBalance => availableToWithdraw + pendingWeb + pendingIos;
}

class RecentPayout {
  final String date;
  final double amount;

  RecentPayout({required this.date, required this.amount});
}

// --- Dummy Data ---
final dummyPayoutBalance = PayoutBalance(
  availableToWithdraw: 204.90,
  pendingWeb: 18.00,
  pendingIos: 62.00,
  recentPayouts: [
    RecentPayout(date: '5 Jul 2024', amount: 150.00),
    RecentPayout(date: '24 Jun 2024', amount: 80.00),
    RecentPayout(date: '13 Jun 2024', amount: 40.00),
  ],
);

class PayoutScreen extends StatefulWidget {
  const PayoutScreen({super.key});

  static Widget _payoutRow(String label, String value, {String? sub}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 13).withEpilogue),
              Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600).withEpilogue),
            ],
          ),
          if (sub != null)
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(sub, style: const TextStyle(fontSize: 11, color: Colors.grey).withEpilogue),
            ),
        ],
      ),
    );
  }

  @override
  State<PayoutScreen> createState() => _PayoutScreenState();
}

class _PayoutScreenState extends State<PayoutScreen> with MySafeState {
  late PayoutProvider _provider;
  late PayoutController _controller;
  final ScrollController _scrollController = ScrollController();

  void _showPayoutDialog(BuildContext context) {
    final available = _provider.availableFunds.get();
    final pending = _provider.pendingFunds.get();

    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(18.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Your Balance', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold).withEpilogue),
              const SizedBox(height: 12),
              PayoutScreen._payoutRow('Available to withdraw', '\$${available.toStringAsFixed(2)}'),
              PayoutScreen._payoutRow('Pending balance', '\$${pending.toStringAsFixed(2)}', sub: 'Will be processed shortly.'),
              const Divider(
                height: 32,
                thickness: 0.8,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Total balance', style: const TextStyle(fontWeight: FontWeight.w600).withEpilogue),
                  Text(
                    '\$${(available + pending).toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.bold).withEpilogue,
                  ),
                ],
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeData.primaryColor.withValues(alpha: 0.6),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  onPressed: available > 0 && !_provider.isLoading.get() ? () => _controller.initiatePayout(context) : null,
                  child: Text(
                    'Withdraw Now',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ).withEpilogue,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _getHistory({bool refresh = true, bool isFromCache = false, bool isNotify = false}) async {
    await _controller.getPayoutHistory(
      isRefresh: refresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
    );
  }

  void _onScroll() {
    final model = _provider.payoutsPaginationModel.get();
    if (model.hasMoreContents.get() &&
        !_provider.isLoading.get() &&
        !_scrollController.position.outOfRange &&
        _scrollController.position.pixels > _scrollController.position.maxScrollExtent - 200) {
      _getHistory(refresh: false, isFromCache: false, isNotify: true);
    }
  }

  @override
  void initState() {
    super.initState();
    _provider = context.read<PayoutProvider>();
    _controller = PayoutController(provider: _provider);
    _controller.fetchAvailableFunds();
    _getHistory(refresh: false, isFromCache: true, isNotify: false);
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    MyPrint.printOnConsole('Payouts List: ${_provider.payoutsPaginationModel.get().contentsList.getList().length}');

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Payouts',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: themeData.colorScheme.onPrimary,
            letterSpacing: -0.5,
          ).withTiempos,
        ),
        backgroundColor: themeData.primaryColor,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      body: Consumer<PayoutProvider>(
        builder: (context, provider, _) {
          final available = provider.availableFunds.get();
          final pending = provider.pendingFunds.get();
          return ListView(
            controller: _scrollController,
            padding: const EdgeInsets.all(12),
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.08),
                      blurRadius: 6,
                      spreadRadius: 0,
                      offset: const Offset(0, 1),
                    )
                  ],
                ),
                child: IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        flex: 3,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Available to withdraw',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                    height: 1.2,
                                  ).withEpilogue,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '\$${available.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    height: 1.2,
                                  ).withEpilogue,
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                TextButton(
                                  onPressed: () => _showPayoutDialog(context),
                                  style: TextButton.styleFrom(
                                    padding: EdgeInsets.zero,
                                    minimumSize: Size.zero,
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  child: Text(
                                    'View details',
                                    style: TextStyle(
                                      color: themeData.primaryColor.withValues(alpha: 0.7),
                                      fontSize: 12,
                                      height: 1.2,
                                    ).withEpilogue,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Icon(
                                  Icons.info_outline,
                                  size: 14,
                                  color: themeData.primaryColor.withValues(alpha: 0.7),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: Center(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: themeData.primaryColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 0,
                              minimumSize: const Size(double.infinity, 40),
                            ),
                            onPressed:
                                available > 0 && !provider.isLoading.get() ? () => _controller.initiatePayout(context) : null,
                            child: FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                'Withdraw Now',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  height: 1.2,
                                ).withEpilogue,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: PayoutScreen._payoutRow('Pending balance', '\$${pending.toStringAsFixed(2)}',
                    sub: 'Will be processed shortly.'),
              ),
              const SizedBox(height: 18),
              Text('Payout History', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14).withEpilogue),
              const SizedBox(height: 8),
              _buildHistoryList(provider.payoutsPaginationModel.get()),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.yellow[50],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.orange[700], size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Payouts are processed within 5-7 business days. Minimum withdrawal is \$10.',
                        style: TextStyle(fontSize: 12, color: Colors.orange[800]).withEpilogue,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHistoryList(APIDocumentsPaginatedListModel<PayoutModel> model) {
    if (model.isContentsFirstTimeLoading.get()) {
      return const Center(child: LoadingWidget());
    }
    final list = model.contentsList.getList();
    if (list.isEmpty) {
      return Column(
        children: [
          const SizedBox(height: 20),
          Center(
            child: Text(
              'No payouts yet',
              style: const TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ).withEpilogue,
            ),
          ),
          const SizedBox(height: 20),
        ],
      );
    }
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length + 1,
      itemBuilder: (context, index) {
        if (index == list.length) {
          return model.isContentsLoading.get()
              ? const Padding(
                  padding: EdgeInsets.symmetric(vertical: 8),
                  child: Center(child: LoadingWidget()),
                )
              : const SizedBox();
        }
        final payout = list[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFF5FAFF),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                payout.createdAt != null ? payout.createdAt!.toLocal().toString().split('T').first : '',
                style: TextStyle(fontSize: 12, color: Colors.grey[700]).withEpilogue,
              ),
              Text(
                '\$${payout.amount.toStringAsFixed(2)}',
                style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: payout.status == 'failed' ? Colors.red : Colors.green[700])
                    .withEpilogue,
              ),
            ],
          ),
        );
      },
    );
  }
}
