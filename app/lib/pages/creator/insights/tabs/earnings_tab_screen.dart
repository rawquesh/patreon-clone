import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/insights_earnings_analytics/earning_tier_model.dart';
import 'package:patreon-clone/backend/insights_earnings_analytics/earnings_analytics_controller.dart';
import 'package:patreon-clone/backend/insights_earnings_analytics/earnings_analytics_provider.dart';

class EarningsData {
  final String id;
  final String tierName;
  final double earnings;
  final int subscribers;
  final Color color;

  EarningsData({
    required this.id,
    required this.tierName,
    required this.earnings,
    required this.subscribers,
    required this.color,
  });
}

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> with MySafeState {
  late EarningsAnalyticsProvider _provider;
  late EarningsAnalyticsController _controller;

  String selectedTimeRange = '7d';
  final Map<String, String> timeRangeOptions = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '180d': 'Last 180 days',
    '1y': 'Last year',
  };

  @override
  void initState() {
    super.initState();
    _provider = context.read<EarningsAnalyticsProvider>();
    _controller = EarningsAnalyticsController(provider: _provider);
    _controller.fetchAnalytics(timeRange: selectedTimeRange);
  }

  int _targetTicksForRange(String r) {
    switch (r) {
      case '7d':
        return 7;
      case '30d':
        return 8;
      case '90d':
        return 8;
      case '180d':
        return 8;
      case '1y':
        return 8;
      default:
        return 8;
    }
  }

  int _stepForRange(int len, String r) {
    final cap = _targetTicksForRange(r);
    return len <= cap ? 1 : (len / cap).ceil();
  }

  String _mmm(int m) =>
      const ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(m - 1).clamp(0, 11)];

  final _isoDay = RegExp(r'^\d{4}-\d{2}-\d{2}$');

  final _weekPat =
      RegExp(r'^(January|February|March|April|May|June|July|August|September|October|November|December)\s+Week\s+(\d+)$');

  static const _monthToNum = {
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

  int _lastDayOfMonth(int y, int m) => DateTime(y, m + 1, 0).day;

  String _weeklyToMidLabel(String raw) {
    final m = _weekPat.firstMatch(raw);
    if (m == null) return raw;
    final mm = _monthToNum[m.group(1)!]!;
    final w = int.tryParse(m.group(2)!) ?? 1;
    final y = DateTime.now().year;
    final last = _lastDayOfMonth(y, mm);
    final start = (w - 1) * 7 + 1;
    final end = (w * 7).clamp(1, last);
    final mid = ((start + end) ~/ 2).clamp(1, last);
    return '$mid/${_mmm(mm)}';
  }

  String _monthNameToShort(String raw) {
    final m = _monthToNum[raw];
    return m == null ? raw : _mmm(m);
  }

  String _fmtXAxisLabel(String period, String range) {
    if (_isoDay.hasMatch(period)) {
      final d = DateTime.tryParse(period);
      if (d != null) {
        return '${d.day}/${_mmm(d.month)}';
      }
    }
    if (_weekPat.hasMatch(period)) {
      return _weeklyToMidLabel(period);
    }
    return _monthNameToShort(period);
  }

  String _fmtTooltipPeriod(String period) {
    if (_isoDay.hasMatch(period)) {
      final d = DateTime.tryParse(period);
      if (d != null) return '${d.day} ${_mmm(d.month)} ${d.year}';
    }
    return period;
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Consumer<EarningsAnalyticsProvider>(
      builder: (context, provider, _) {
        return ModalProgressHUD(
          inAsyncCall: provider.isLoading.get(),
          opacity: 0.5,
          progressIndicator: const LoadingWidget(),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildTimeRangeSelector(),
                const SizedBox(height: 12),
                _buildBalanceCards(provider),
                const SizedBox(height: 12),
                _buildEarningsChart(provider),
                const SizedBox(height: 12),
                _buildEarningsByTierCard(provider),
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
      child: DropdownButton<String>(
        value: selectedTimeRange,
        isExpanded: true,
        underline: const SizedBox(),
        icon: const Icon(Icons.keyboard_arrow_down, size: 18),
        style: const TextStyle(
          fontSize: 12,
          color: Colors.black87,
          fontWeight: FontWeight.w500,
        ).withEpilogue,
        items: timeRangeOptions.entries.map((e) {
          return DropdownMenuItem<String>(
            value: e.key,
            child: Text(e.value),
          );
        }).toList(),
        onChanged: (value) {
          if (value != null) {
            setState(() {
              selectedTimeRange = value;
            });
            _controller.fetchAnalytics(timeRange: value);
          }
        },
      ),
    );
  }

  Widget _buildBalanceCards(EarningsAnalyticsProvider provider) {
    final available = provider.availablePayout.get();
    final pending = provider.pendingBalance.get();
    return Row(
      children: [
        Expanded(
          child: _buildBalanceCard('Available Balance', available, Colors.green[600]!, Icons.account_balance_wallet),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildBalanceCard('Pending Balance', pending, Colors.orange[600]!, Icons.hourglass_empty),
        ),
      ],
    );
  }

  Widget _buildBalanceCard(String title, double amount, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.08),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey[600],
                  ).withEpilogue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '\$${amount.toStringAsFixed(2)}',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ).withEpilogue,
          ),
        ],
      ),
    );
  }

  Widget _buildEarningsChart(EarningsAnalyticsProvider provider) {
    final earnings = provider.monthlyEarnings.getList();
    final periods = provider.periods.getList();

    if (earnings.isEmpty || periods.isEmpty) {
      return Center(child: _buildEmptyChartState());
    }

    final n = math.min(earnings.length, periods.length);
    final ys = earnings.take(n).toList();
    final xs = periods.take(n).toList();

    if (ys.isEmpty) return Center(child: _buildEmptyChartState());

    final spots = List<FlSpot>.generate(n, (i) => FlSpot(i.toDouble(), ys[i]));
    final maxY = ys.reduce(math.max);
    final minY = ys.reduce(math.min);
    final range = (maxY - minY).abs();
    final yInt = range > 0 ? (range / 4).clamp(1.0, double.infinity) : 1.0;

    final step = _stepForRange(xs.length, selectedTimeRange);

    // headline amount: prefer server total; else sum of visible period
    final serverTotal = provider.totalEarnings.get();
    final periodTotal = ys.fold<double>(0.0, (a, b) => a + b);
    final displayAmount = (serverTotal > 0) ? serverTotal : periodTotal;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Earnings Trend',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.black87).withEpilogue),
              Text(timeRangeOptions[selectedTimeRange] ?? selectedTimeRange,
                  style: TextStyle(fontSize: 9, color: Colors.grey[600]).withEpilogue),
            ],
          ),
          const SizedBox(height: 6),
          Text('\$${displayAmount.toStringAsFixed(2)}',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black).withEpilogue),
          const SizedBox(height: 16),

          SizedBox(
            height: 200,
            child: LineChart(
              LineChartData(
                clipData: const FlClipData.all(),
                minX: 0,
                maxX: (n - 1).toDouble(),
                minY: 0,
                maxY: (maxY == 0) ? 1 : maxY * 1.1,
                // ensure visible even if flat 0

                // grid
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: yInt,
                  getDrawingHorizontalLine: (v) => FlLine(color: Colors.grey[200]!, strokeWidth: 1),
                ),

                // titles
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      interval: yInt,
                      getTitlesWidget: (v, meta) {
                        if (v == meta.min || v == meta.max) {
                          return const SizedBox(); // cleaner
                        }
                        return Padding(
                          padding: const EdgeInsets.only(right: 4),
                          child: Text('\$${v.toStringAsFixed(0)}',
                              style: TextStyle(fontSize: 8, color: Colors.grey[600]).withEpilogue),
                        );
                      },
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 26,
                      interval: 1,
                      getTitlesWidget: (value, meta) {
                        final i = value.toInt();
                        if (i < 0 || i >= xs.length) {
                          return const SizedBox.shrink();
                        }

                        // show only every "step"th + last
                        final show = (i % step == 0) || (i == xs.length - 1);
                        if (!show) return const SizedBox.shrink();

                        final txt = _fmtXAxisLabel(xs[i], selectedTimeRange);
                        return SideTitleWidget(
                          meta: meta,
                          space: 4,
                          angle: -0.7, // ~ -40°, compact
                          child: Text(
                            txt,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 8.5,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ).withEpilogue,
                          ),
                        );
                      },
                    ),
                  ),
                ),

                // border
                borderData: FlBorderData(
                  show: true,
                  border: Border(
                    bottom: BorderSide(color: Colors.grey[300]!),
                    left: BorderSide(color: Colors.grey[300]!),
                  ),
                ),

                // line
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    isCurved: true,
                    curveSmoothness: 0.1,
                    color: themeData.primaryColor.withValues(alpha: 0.8),
                    barWidth: 2.5,
                    isStrokeCapRound: true,
                    dotData: FlDotData(
                      show: true,
                      getDotPainter: (spot, percent, bar, index) => FlDotCirclePainter(
                        radius: 3,
                        color: themeData.primaryColor.withValues(alpha: 0.5),
                        strokeWidth: 2,
                        strokeColor: Colors.white,
                      ),
                    ),
                    belowBarData: BarAreaData(
                      show: true,
                      color: themeData.primaryColor.withValues(alpha: 0.2).withValues(alpha: 0.15),
                    ),
                  ),
                ],

                // interactions
                lineTouchData: LineTouchData(
                  handleBuiltInTouches: true,
                  touchTooltipData: LineTouchTooltipData(
                    tooltipBorder: BorderSide(color: Colors.grey[300]!),
                    getTooltipItems: (touched) => touched.map((t) {
                      final i = t.x.toInt();
                      final period = (i >= 0 && i < xs.length) ? xs[i] : '';
                      return LineTooltipItem(
                        '\$${t.y.toStringAsFixed(2)}\n${_fmtTooltipPeriod(period)}',
                        const TextStyle(color: Colors.black87, fontSize: 10, fontWeight: FontWeight.w500).withEpilogue,
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyChartState() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SizedBox(
        height: 120,
        width: double.infinity,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              Icons.analytics_outlined,
              size: 40,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 8),
            Text(
              'No earnings data available',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.grey[600],
              ).withEpilogue,
            ),
            const SizedBox(height: 4),
            Text(
              'Data will appear once you start earning',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[500],
              ).withEpilogue,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEarningsByTierCard(EarningsAnalyticsProvider provider) {
    final tiers = provider.tierBreakdown.getList();
    final total = provider.totalEarnings.get();

    if (tiers.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withValues(alpha: 0.1),
              spreadRadius: 1,
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(
              Icons.pie_chart_outline,
              size: 40,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 8),
            Text(
              'No tier data available',
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ).withEpilogue,
            ),
          ],
        ),
      );
    }

    final colors = [
      themeData.primaryColor.withValues(alpha: 0.6),
      Colors.purple[600]!,
      Colors.green[600]!,
      Colors.orange[600]!,
      Colors.red[600]!,
      Colors.pink[600]!,
      Colors.teal[600]!,
      Colors.indigo[600]!,
    ];

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Earnings by Tier',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ).withEpilogue,
              ),
              Text(
                'Total: \$${total.toStringAsFixed(2)}',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: themeData.primaryColor.withValues(alpha: 0.3),
                ).withEpilogue,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Column(
                  children: [for (var i = 0; i < tiers.length; i++) _buildTierItem(tiers[i], colors[i % colors.length], total)],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 1,
                child: _buildTierChart(tiers, colors, total),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTierItem(EarningTierModel tier, Color color, double total) {
    final percentage = total > 0 ? (tier.amount / total) * 100 : 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tier.name,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ).withEpilogue,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '\$${tier.amount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ).withEpilogue,
              ),
              Text(
                '${percentage.toStringAsFixed(1)}%',
                style: TextStyle(
                  fontSize: 9,
                  color: Colors.grey[600],
                ).withEpilogue,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTierChart(List<EarningTierModel> tiers, List<Color> colors, double total) {
    if (total <= 0) {
      return SizedBox(
        height: 80,
        child: Center(
          child: Text(
            'No data',
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey[500],
            ).withEpilogue,
          ),
        ),
      );
    }

    return SizedBox(
      height: 80,
      child: PieChart(
        PieChartData(
          sectionsSpace: 2,
          centerSpaceRadius: 20,
          sections: [
            for (var i = 0; i < tiers.length; i++)
              PieChartSectionData(
                color: colors[i % colors.length],
                value: tiers[i].amount,
                title: '${((tiers[i].amount / total) * 100).toStringAsFixed(1)}%',
                radius: 25,
                titleStyle: const TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ).withEpilogue,
              ),
          ],
          pieTouchData: PieTouchData(
            touchCallback: (FlTouchEvent event, pieTouchResponse) {},
          ),
        ),
      ),
    );
  }
}
