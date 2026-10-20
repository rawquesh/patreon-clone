import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon_clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon_clone/backend/insights_posts_analytics/post_analytics_post_model.dart';
import 'package:patreon_clone/backend/insights_posts_analytics/posts_analytics_controller.dart';
import 'package:patreon_clone/backend/insights_posts_analytics/posts_analytics_provider.dart';

class Post {
  final String id;
  final String title;
  final int impressions;
  final int engagements;

  Post({
    required this.id,
    required this.title,
    required this.impressions,
    required this.engagements,
  });
}

class PostsAnalyticsScreen extends StatefulWidget {
  const PostsAnalyticsScreen({super.key});

  @override
  State<PostsAnalyticsScreen> createState() => _PostsAnalyticsScreenState();
}

class _PostsAnalyticsScreenState extends State<PostsAnalyticsScreen> with MySafeState {
  late PostsAnalyticsProvider _provider;
  late PostsAnalyticsController _controller;

  String selectedTimeRange = '90d';
  final Map<String, String> timeRangeOptions = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
  };

  @override
  void initState() {
    super.initState();
    _provider = context.read<PostsAnalyticsProvider>();
    _controller = PostsAnalyticsController(provider: _provider);
    _controller.fetchAnalytics(timeRange: selectedTimeRange);
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Consumer<PostsAnalyticsProvider>(
      builder: (context, provider, _) {
        return ModalProgressHUD(
          inAsyncCall: provider.isLoading.get(),
          opacity: 0.5,
          progressIndicator: const LoadingWidget(),
          child: Scaffold(
            body: SingleChildScrollView(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTimeRangeSelector(),
                  const SizedBox(height: 16),
                  _buildImpressionsCard(provider),
                  const SizedBox(height: 16),
                  _buildTopPerformingPostsCard(provider),
                ],
              ),
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
        onChanged: (String? newValue) {
          if (newValue != null) {
            setState(() {
              selectedTimeRange = newValue;
            });
            _controller.fetchAnalytics(timeRange: newValue);
          }
        },
      ),
    );
  }

  Widget _buildImpressionsCard(PostsAnalyticsProvider provider) {
    // --- series data ---
    final imp = provider.impressionData.getList().map((e) => e.toDouble()).toList();
    final eng = provider.engagementData.getList().map((e) => e.toDouble()).toList();
    final periods = provider.periods.getList();

    // align series defensively
    final len = [imp.length, eng.length, periods.length].reduce((a, b) => a < b ? a : b);
    final ysImp = imp.take(len).toList();
    final ysEng = eng.take(len).toList();
    final xs = periods.take(len).toList();

    if (len == 0) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(color: Colors.grey.withValues(alpha: 0.1), spreadRadius: 1, blurRadius: 4, offset: const Offset(0, 2))
          ],
        ),
        child: const SizedBox(height: 200, child: Center(child: Text('No data'))),
      );
    }

    // --- small helpers ---
    int targetTicksFor(String r) {
      switch (r) {
        case '7d':
          return 7;
        case '30d':
          return 8;
        case '90d':
          return 8;
        default:
          return 8;
      }
    }

    int stepFor(int length, String range) {
      final cap = targetTicksFor(range);
      return length <= cap ? 1 : (length / cap).ceil();
    }

    String mmm(int m) =>
        const ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(m - 1).clamp(0, 11)];
    int lastDayOfMonth(int y, int m) => DateTime(y, m + 1, 0).day;

    final isoDay = RegExp(r'^\d{4}-\d{2}-\d{2}$');
    final weekPat =
        RegExp(r'^(January|February|March|April|May|June|July|August|September|October|November|December)\s+Week\s+(\d+)$');
    const monthMap = {
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

    String fmtXAxisLabel(String raw) {
      if (isoDay.hasMatch(raw)) {
        final d = DateTime.tryParse(raw);
        if (d != null) return '${d.day}/${mmm(d.month)}';
      }
      final m = weekPat.firstMatch(raw);
      if (m != null) {
        final mm = monthMap[m.group(1)!]!;
        final w = int.tryParse(m.group(2)!) ?? 1;
        final y = DateTime.now().year;
        final last = lastDayOfMonth(y, mm);
        final start = (w - 1) * 7 + 1;
        final end = (w * 7).clamp(1, last);
        final mid = ((start + end) ~/ 2).clamp(1, last);
        return '$mid/${mmm(mm)}';
      }
      final mmName = monthMap[raw];
      if (mmName != null) return mmm(mmName);
      return raw;
    }

    // --- spots ---
    final spotsImp = List<FlSpot>.generate(len, (i) => FlSpot(i.toDouble(), ysImp[i]));
    final spotsEng = List<FlSpot>.generate(len, (i) => FlSpot(i.toDouble(), ysEng[i]));

    // --- y scales ---
    final impMax = ysImp.reduce((a, b) => a > b ? a : b);
    final engMax = ysEng.reduce((a, b) => a > b ? a : b);
    final yMaxUnified = [impMax, engMax].reduce((a, b) => a > b ? a : b);
    final safeMaxY = yMaxUnified == 0 ? 1.0 : yMaxUnified * 1.1;
    final yInterval = (safeMaxY / 5).ceilToDouble().clamp(1.0, double.infinity);

    String rightAxisText(double leftAxisValue) {
      if (engMax <= 0) return '0';
      final scaled = (leftAxisValue / safeMaxY) * engMax;
      return scaled.round().toString();
    }

    final step = stepFor(xs.length, selectedTimeRange);

    // --- totals (new) ---
    final totalImpressions = provider.totalImpressions.get();
    final totalEngagements = provider.totalEngagements.get();

    Widget miniTotal(String label, int value, Color color) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
              const SizedBox(width: 6),
              Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color).withEpilogue),
              const SizedBox(width: 4),
              Text(value.toString(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color).withEpilogue),
            ],
          ),
        );

    // line colors
    final impLine = Colors.red[400]!;
    final impArea = Colors.red[200]!.withValues(alpha: 0.12);
    final engLine = themeData.primaryColor.withValues(alpha: 0.5);
    final engArea = themeData.primaryColor.withValues(alpha: 0.2);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: Colors.grey.withValues(alpha: 0.1), spreadRadius: 1, blurRadius: 4, offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // header with compact totals (replaces "Last updated")
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Stats',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.black87).withEpilogue,
              ),
              Row(
                children: [
                  miniTotal('Impressions', totalImpressions, impLine),
                  const SizedBox(width: 8),
                  miniTotal('Engagements', totalEngagements, engLine),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // legend
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _legendChip(color: impLine, label: 'Impressions'),
              const SizedBox(width: 12),
              _legendChip(color: engLine, label: 'Engagements'),
            ],
          ),
          const SizedBox(height: 8),

          // chart
          SizedBox(
            height: 220,
            child: LineChart(
              LineChartData(
                clipData: const FlClipData.all(),
                minX: 0,
                maxX: (len - 1).toDouble(),
                minY: 0,
                maxY: safeMaxY,
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: yInterval,
                  getDrawingHorizontalLine: (_) => FlLine(color: Colors.grey[200]!, strokeWidth: 1),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 28,
                      interval: yInterval,
                      getTitlesWidget: (v, meta) => Text(
                        v.toInt().toString(),
                        style: TextStyle(fontSize: 9, color: Colors.grey[600]).withEpilogue,
                      ),
                    ),
                  ),
                  rightTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 18,
                      interval: yInterval,
                      getTitlesWidget: (v, meta) => Text(
                        rightAxisText(v),
                        style: TextStyle(fontSize: 9, color: Colors.grey[600]).withEpilogue,
                        textAlign: TextAlign.right,
                      ),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 26,
                      interval: 1,
                      getTitlesWidget: (value, meta) {
                        final i = value.toInt();
                        if (i < 0 || i >= xs.length) return const SizedBox.shrink();
                        final show = (i % step == 0) || (i == xs.length - 1);
                        if (!show) return const SizedBox.shrink();
                        return SideTitleWidget(
                          meta: meta,
                          space: 4,
                          angle: -0.7,
                          child: Text(
                            fmtXAxisLabel(xs[i]),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: 8.5, color: Colors.grey[600], fontWeight: FontWeight.w500).withEpilogue,
                          ),
                        );
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(
                  show: true,
                  border: Border(
                    bottom: BorderSide(color: Colors.grey[300]!),
                    left: BorderSide(color: Colors.grey[300]!),
                  ),
                ),
                lineBarsData: [
                  // Impressions
                  LineChartBarData(
                    spots: spotsImp,
                    isCurved: true,
                    curveSmoothness: 0.25,
                    color: impLine,
                    barWidth: 2.5,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(show: true, color: impArea),
                  ),
                  // Engagements
                  LineChartBarData(
                    spots: spotsEng,
                    isCurved: true,
                    curveSmoothness: 0.25,
                    color: engLine,
                    barWidth: 2.5,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(show: true, color: engArea),
                  ),
                ],
                lineTouchData: LineTouchData(
                  handleBuiltInTouches: true,
                  touchTooltipData: LineTouchTooltipData(
                    tooltipBorder: BorderSide(color: Colors.grey[300]!),
                    getTooltipItems: (touched) => touched.map((t) {
                      final idx = t.x.toInt();
                      final isImp = t.bar.color == impLine;
                      final label = isImp ? 'Impressions' : 'Engagements';
                      final period = (idx >= 0 && idx < xs.length) ? xs[idx] : '';
                      return LineTooltipItem(
                        '$label: ${t.y.toStringAsFixed(0)}\n${fmtXAxisLabel(period)}',
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

  Widget _legendChip({required Color color, required String label}) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: color.withOpacity(0.35)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 10, height: 2, color: color),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color).withEpilogue),
          ],
        ),
      );

  Widget _buildTopPerformingPostsCard(PostsAnalyticsProvider provider) {
    final posts = provider.topPerformingPosts.getList();
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
          Text(
            'Top Performing Posts',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ).withEpilogue,
          ),
          const SizedBox(height: 12),
          if (posts.isEmpty)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                'No data available',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: posts.length,
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final post = posts[index];
                return _buildPostItem(post);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildPostItem(PostAnalyticsPostModel post) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              post.title,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ).withEpilogue,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 12),
          _buildMetricChip('Impressions', post.impressions),
          const SizedBox(width: 8),
          _buildMetricChip('Engagements', post.engagements),
        ],
      ),
    );
  }

  Widget _buildMetricChip(String label, int value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: themeData.primaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w500,
              color: themeData.primaryColor,
            ).withEpilogue,
          ),
          Text(
            value.toString(),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: themeData.primaryColor,
            ).withEpilogue,
          ),
        ],
      ),
    );
  }
}
