import 'package:patreon_clone/utils/my_print.dart';

import 'membership_analytics_provider.dart';
import 'membership_analytics_repository.dart';

class MembershipAnalyticsController {
  final MembershipAnalyticsProvider provider;
  final MembershipAnalyticsRepository _repository;

  MembershipAnalyticsController({required this.provider, MembershipAnalyticsRepository? repository})
      : _repository = repository ?? MembershipAnalyticsRepository();

  Future<void> fetchAnalytics({String timeRange = '7d', bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);

    final result = await _repository.getAnalytics(timeRange: timeRange);
    if (result != null) {
      provider.activeMembers.set(value: result.activeMembers, isNotify: false);
      provider.activeGrowth.set(value: result.activeGrowth, isNotify: false);
      provider.newMembers.set(value: result.newMembers, isNotify: false);
      provider.upgradedMembers.set(value: result.upgradedMembers, isNotify: false);
      provider.cancelledMembers.set(value: result.cancelledMembers, isNotify: false);

      // Legacy: set but unused by chart
      provider.membershipData.setList(list: result.membershipData, isClear: true, isNotify: false);

      // NEW: the important one for chart
      provider.membershipPoints.setList(list: result.membershipPoints, isClear: true, isNotify: false);

      provider.tiers.setList(list: result.tiers, isClear: true, isNotify: false);
      provider.notify(isNotify: isNotify);
    } else {
      MyPrint.printOnConsole('Membership analytics response null');
    }

    provider.isLoading.set(value: false, isNotify: isNotify);
  }
}
