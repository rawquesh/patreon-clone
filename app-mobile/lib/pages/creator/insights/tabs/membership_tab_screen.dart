import 'dart:math';

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/insights_memberships_analytics/membership_analytics_controller.dart';
import 'package:patreon-clone/backend/insights_memberships_analytics/membership_analytics_provider.dart';

class MembershipTabScreen extends StatefulWidget {
  const MembershipTabScreen({super.key});

  @override
  State<MembershipTabScreen> createState() => _MembershipTabScreenState();
}

class _MembershipTabScreenState extends State<MembershipTabScreen> with MySafeState {
  late MembershipAnalyticsProvider _provider;
  late MembershipAnalyticsController _controller;

  String selectedTimeRange = '180d';
  final Map<String, String> timeRangeOptions = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '180d': 'Last 180 days',
  };

  @override
  void initState() {
    super.initState();
    _provider = context.read<MembershipAnalyticsProvider>();
    _controller = MembershipAnalyticsController(provider: _provider);
    selectedTimeRange = '180d';
    _controller.fetchAnalytics(timeRange: selectedTimeRange);
  }

  Map<String, dynamic> getChartConfig(String timeRange, List<int> data) {
    int groupSize = 1;
    bool showDots = true;
    int labelInterval = 1;

    switch (timeRange) {
      case '7d':
        groupSize = 1;
        showDots = true;
        labelInterval = 1;
        break;
      case '30d':
        groupSize = 1;
        showDots = data.length <= 31;
        labelInterval = 5;
        break;
      case '90d':
        groupSize = 7;
        showDots = false;
        labelInterval = 2;
        break;
      case '180d':
        groupSize = 15;
        showDots = false;
        labelInterval = 2;
        break;
      default:
        groupSize = 1;
        labelInterval = 1;
    }

    return {
      'groupSize': groupSize,
      'showDots': showDots,
      'labelInterval': labelInterval,
    };
  }

  List<int> groupData(List<int> data, int groupSize) {
    if (groupSize <= 1) return data;

    List<int> grouped = [];
    for (int i = 0; i < data.length; i += groupSize) {
      int end = (i + groupSize < data.length) ? i + groupSize : data.length;
      int sum = data.sublist(i, end).fold(0, (a, b) => a + b);
      grouped.add(sum);
    }
    return grouped;
  }

  String formatDateLabel(int index, String timeRange, int dataLength, {required int groupSize}) {
    final now = DateTime.now();

    switch (timeRange) {
      case '7d':
        final date = now.subtract(Duration(days: (dataLength - 1 - index)));
        return '${_shortMonth(date.month)} ${date.day}';

      case '30d':
        final date = now.subtract(Duration(days: (dataLength - 1 - index)));
        return '${_shortMonth(date.month)} ${date.day}';

      case '90d':
        final weeksBack = (dataLength - 1 - index);
        final weekStartDate = now.subtract(Duration(days: weeksBack * 7));
        final weekNumber = ((weekStartDate.day - 1) ~/ 7) + 1;
        return '${_shortMonth(weekStartDate.month)} W $weekNumber';

      case '180d':
        final weeksBack = (dataLength - 1 - index) * 2;
        final date = now.subtract(Duration(days: weeksBack * 7));
        return '${_shortMonth(date.month)} W ${((date.day - 1) ~/ 14) + 1}';

      default:
        final date = now.subtract(Duration(days: (dataLength - 1 - index)));
        return '${_shortMonth(date.month)} ${date.day}';
    }
  }

  int _lastDayOfMonth(int year, int month) => DateTime(year, month + 1, 0).day;

  String compactWeeklyOrDailyLabel(String raw, {int? year}) {
    // 1) Daily ISO
    final iso = RegExp(r'^\d{4}-\d{2}-\d{2}$');
    if (iso.hasMatch(raw)) {
      final d = DateTime.tryParse(raw);
      if (d != null) return '${d.day}/${_shortMonth(d.month)}';
    }

    // 2) Weekly "Month Week N"
    final months = {
      'January': 1,
      'February': 2,
      'March': 3,
      'April': 4,
      'May': 5,
      'June': 6,
      'July': 7,
      'August': 8,
      'September': 9,
      'October': 10,
      'November': 11,
      'December': 12,
    };
    final wk =
        RegExp(r'^(January|February|March|April|May|June|July|August|September|October|November|December)\s+Week\s+(\d+)$');
    final m = wk.firstMatch(raw);
    if (m != null) {
      final monthName = m.group(1)!;
      final weekIdx = int.tryParse(m.group(2) ?? '') ?? 1;
      final mm = months[monthName]!;
      final yy = year ?? DateTime.now().year;

      // week range within month: [ (w-1)*7+1  ...  min(w*7, lastDay) ]
      final start = (weekIdx - 1) * 7 + 1;
      final end = (weekIdx * 7).clamp(1, _lastDayOfMonth(yy, mm));
      final mid = (start + end) ~/ 2; // middle day in that week window

      final safeMid = mid.clamp(1, _lastDayOfMonth(yy, mm));
      return '$safeMid/${_shortMonth(mm)}';
    }

    // 3) Monthly names already compact enough (e.g., "August")
    return raw;
  }

  String _shortMonth(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[(month - 1).clamp(0, 11)];
  }

  int _labelStep8(int length) => length <= 8 ? 1 : (length / 8).ceil();

  String _compactLabel(String raw) {
    final iso = RegExp(r'^\d{4}-\d{2}-\d{2}$');
    if (iso.hasMatch(raw)) {
      final d = DateTime.tryParse(raw);
      if (d != null) return '${d.day}/${_shortMonth(d.month)}';
    }
    // e.g., "June Week 2" or "August" just pass through
    return raw;
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Consumer<MembershipAnalyticsProvider>(
      builder: (context, provider, _) {
        return ModalProgressHUD(
          inAsyncCall: provider.isLoading.get(),
          opacity: 0.5,
          progressIndicator: const LoadingWidget(),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildTimeRangeSelector(),
                const SizedBox(height: 16),
                _buildActiveMembers(provider),
                const SizedBox(height: 24),
                _buildMembershipTiers(provider),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTimeRangeSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selectedTimeRange,
          isExpanded: true,
          icon: Icon(Icons.expand_more, size: 20, color: Colors.grey.shade600),
          style: const TextStyle(fontSize: 13, color: Colors.black87, fontWeight: FontWeight.w600).withEpilogue,
          items: timeRangeOptions.entries.map((entry) {
            return DropdownMenuItem<String>(value: entry.key, child: Text(entry.value));
          }).toList(),
          onChanged: (String? newValue) {
            if (newValue != null && newValue != selectedTimeRange) {
              setState(() => selectedTimeRange = newValue);
              _controller.fetchAnalytics(timeRange: newValue);
            }
          },
        ),
      ),
    );
  }

  Widget _buildActiveMembers(MembershipAnalyticsProvider provider) {
    final points = provider.membershipPoints.getList(); // NEW list

    if (points.isEmpty) {
      return _emptyCard("No membership data available.");
    }

    final values = points.map((p) => p.value).toList();
    final labels = points.map((p) => p.label).toList();

    final total = values.fold<int>(0, (a, b) => a + b.toInt());

    if (total == 0) {
      return _emptyCard("No new member activity in this period.");
    }

    final step = _labelStep8(labels.length);
    final maxY = values.reduce(max).toDouble();

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _headerChip(),
            const SizedBox(height: 24),
            SizedBox(
              height: 220,
              child: BarChart(
                BarChartData(
                  maxY: maxY == 0 ? 1 : maxY * 1.25,
                  barTouchData: BarTouchData(
                    enabled: true,
                    handleBuiltInTouches: true,
                    touchTooltipData: BarTouchTooltipData(
                      // tooltipBgColor: Colors.black.withOpacity(0.75),
                      fitInsideHorizontally: true,
                      fitInsideVertically: true,
                      getTooltipItem: (group, groupIndex, rod, rodIndex) {
                        final label = labels[group.x.toInt()];
                        final val = rod.toY.toInt();
                        return BarTooltipItem(
                          '${_compactLabel(label)}\n$val',
                          const TextStyle(color: Colors.white, fontWeight: FontWeight.w600).withEpilogue,
                        );
                      },
                    ),
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 28, // smaller since we're tilting
                        getTitlesWidget: (value, meta) {
                          final i = value.toInt();
                          if (i < 0 || i >= labels.length) return const SizedBox.shrink();
                          final show = (i % step == 0) || (i == labels.length - 1);
                          if (!show) return const SizedBox.shrink();

                          final text = compactWeeklyOrDailyLabel(labels[i]);

                          return SideTitleWidget(
                            meta: meta,
                            space: 4,
                            angle: -0.7, // ~-40° tilt (radians). Try -0.8 for ~-46°
                            child: Text(
                              text,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 8.5, // a touch smaller helps
                                fontWeight: FontWeight.w500,
                              ).withEpilogue,
                            ),
                          );
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        interval: maxY > 10 ? (maxY / 4).ceilToDouble() : 1,
                        reservedSize: 28,
                        getTitlesWidget: (value, meta) => Text(
                          value.toInt().toString(),
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                          ).withEpilogue,
                        ),
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    horizontalInterval: maxY > 10 ? (maxY / 4).ceilToDouble() : 1,
                    getDrawingHorizontalLine: (value) => FlLine(
                      color: Colors.grey.shade200,
                      strokeWidth: 1,
                    ),
                  ),
                  barGroups: values.asMap().entries.map((e) {
                    final idx = e.key;
                    final val = e.value;
                    final hasData = val > 0;
                    return BarChartGroupData(
                      x: idx,
                      barRods: [
                        BarChartRodData(
                          toY: val.toDouble(),
                          color: hasData ? themeData.primaryColor : Colors.grey.shade200,
                          width: 12,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(4),
                            topRight: Radius.circular(4),
                          ),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: 12),
            _statsSummary(values),
          ],
        ),
      ),
    );
  }

  Widget _emptyCard(String message) => Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        child: SizedBox(
          height: 300,
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
              ),
            ),
          ),
        ),
      );

  Widget _headerChip() => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text("Memberships Data", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold).withEpilogue),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: themeData.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              timeRangeOptions[selectedTimeRange] ?? selectedTimeRange,
              style: TextStyle(fontSize: 10, color: themeData.primaryColor, fontWeight: FontWeight.w600).withEpilogue,
            ),
          ),
        ],
      );

  Widget _statsSummary(List<double> values) {
    final total = values.fold<int>(0, (a, b) => a + b.toInt());
    final avg = values.isNotEmpty ? (total / values.length).toStringAsFixed(1) : "--";
    final peak = values.isNotEmpty ? values.reduce(max).toString() : "0";
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildSummaryItem("Total", total.toString()),
          _buildSummaryItem("Average", avg),
          _buildSummaryItem("Peak", peak),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey.shade200, width: 0.5),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: themeData.primaryColor).withEpilogue),
          Text(label, style: TextStyle(fontSize: 10, color: Colors.grey.shade600, fontWeight: FontWeight.w500).withEpilogue),
        ],
      ),
    );
  }

  Widget _buildMembershipTiers(MembershipAnalyticsProvider provider) {
    final tiers = provider.tiers.getList();
    if (tiers.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text("No membership data available.", style: TextStyle(fontSize: 15, color: Colors.grey.shade600)),
        ),
      );
    }
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Membership Tiers",
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 0.2).withEpilogue),
            const SizedBox(height: 10),
            ...tiers.map((membership) => _buildTierCard(membership)),
          ],
        ),
      ),
    );
  }

  Widget _buildTierCard(MembershipModel membership) {
    final bool isActive = membership.isActive;
    final int count = membership.analyticsCount;
    final int growth = membership.analyticsGrowth;
    final Color accent = isActive ? themeData.primaryColor : Colors.grey.shade400;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isActive ? accent.withOpacity(0.06) : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: accent.withOpacity(0.3), width: 1),
      ),
      child: Row(
        children: [
          CircleAvatar(
              radius: 16,
              backgroundColor: accent.withOpacity(0.11),
              child: Icon(Icons.workspace_premium_rounded, color: accent, size: 18)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        membership.name,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, letterSpacing: 0.1).withEpilogue,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (membership.isFeatured) ...[
                      const SizedBox(width: 4),
                      Icon(Icons.star, color: Colors.amber.shade600, size: 16)
                    ]
                  ],
                ),
                if (growth != 0)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Row(
                      children: [
                        Icon(growth > 0 ? CupertinoIcons.arrowtriangle_up_circle : CupertinoIcons.arrowtriangle_down_circle,
                            size: 13, color: growth > 0 ? Colors.green : Colors.red),
                        const SizedBox(width: 2),
                        Text("${growth > 0 ? '+' : ''}$growth% this period",
                            style: TextStyle(
                                    fontSize: 11, color: growth > 0 ? Colors.green : Colors.red, fontWeight: FontWeight.w500)
                                .withEpilogue),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: accent.withOpacity(0.10), borderRadius: BorderRadius.circular(8)),
            child: Row(
              children: [
                Icon(Icons.people, size: 15, color: accent),
                const SizedBox(width: 6),
                Text(count.toString(),
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: accent, letterSpacing: 0.2).withEpilogue),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
