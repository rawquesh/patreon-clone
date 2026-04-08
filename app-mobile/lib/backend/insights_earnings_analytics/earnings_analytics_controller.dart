import 'earnings_analytics_provider.dart';
import 'earnings_analytics_repository.dart';

class EarningsAnalyticsController {
  final EarningsAnalyticsProvider provider;
  final EarningsAnalyticsRepository _repository;

  EarningsAnalyticsController({required this.provider, EarningsAnalyticsRepository? repository})
      : _repository = repository ?? EarningsAnalyticsRepository();

  Future<void> fetchAnalytics({String timeRange = '7d', bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final result = await _repository.getAnalytics(timeRange: timeRange);
    if (result != null) {
      provider.totalEarnings.set(value: result.totalEarnings, isNotify: false);
      provider.growthPercentage.set(value: result.growthPercentage, isNotify: false);
      provider.monthlyEarnings.setList(list: result.monthlyEarnings, isClear: true, isNotify: false);
      provider.periods.setList(list: result.periods, isClear: true, isNotify: false);
      provider.tierBreakdown.setList(list: result.tierBreakdown, isClear: true, isNotify: false);
      provider.availablePayout.set(value: result.availablePayout, isNotify: false);
      provider.pendingBalance.set(value: result.pendingBalance, isNotify: false);
      provider.notify(isNotify: isNotify);
    }
    provider.isLoading.set(value: false, isNotify: isNotify);
  }
}