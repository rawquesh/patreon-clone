import 'package:patreon_clone/backend/common/common_provider.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';

import 'package:patreon_clone/pages/creator/insights/membership_chart_point_model.dart';

class MembershipAnalyticsProvider extends CommonProvider {
  MembershipAnalyticsProvider() {
    isLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);
    activeMembers = CommonProviderPrimitiveParameter<int>(value: 0, notify: notify);
    activeGrowth = CommonProviderPrimitiveParameter<double>(value: 0.0, notify: notify);
    newMembers = CommonProviderPrimitiveParameter<int>(value: 0, notify: notify);
    upgradedMembers = CommonProviderPrimitiveParameter<int>(value: 0, notify: notify);
    cancelledMembers = CommonProviderPrimitiveParameter<int>(value: 0, notify: notify);

    // Keep legacy ints but don't use in the chart anymore
    membershipData = CommonProviderListParameter<int>(list: [], notify: notify);

    // NEW: the correct, ordered series for the chart
    membershipPoints = CommonProviderListParameter<MembershipChartPointModel>(
      list: [],
      notify: notify,
    );

    tiers = CommonProviderListParameter<MembershipModel>(list: [], notify: notify);
  }

  late CommonProviderPrimitiveParameter<bool> isLoading;
  late CommonProviderPrimitiveParameter<int> activeMembers;
  late CommonProviderPrimitiveParameter<double> activeGrowth;
  late CommonProviderPrimitiveParameter<int> newMembers;
  late CommonProviderPrimitiveParameter<int> upgradedMembers;
  late CommonProviderPrimitiveParameter<int> cancelledMembers;

  // Legacy
  late CommonProviderListParameter<int> membershipData;

  // NEW
  late CommonProviderListParameter<MembershipChartPointModel> membershipPoints;

  late CommonProviderListParameter<MembershipModel> tiers;
}
