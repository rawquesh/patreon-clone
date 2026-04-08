import 'package:patreon-clone/backend/common/common_provider.dart';

import 'earning_tier_model.dart';

class EarningsAnalyticsProvider extends CommonProvider {
  EarningsAnalyticsProvider() {
    isLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);
    totalEarnings = CommonProviderPrimitiveParameter<double>(value: 0.0, notify: notify);
    growthPercentage = CommonProviderPrimitiveParameter<double>(value: 0.0, notify: notify);
    monthlyEarnings = CommonProviderListParameter<double>(list: [], notify: notify);
    earningsData = CommonProviderListParameter<double>(list: [], notify: notify); // Add this
    periods = CommonProviderListParameter<String>(list: [], notify: notify);
    tierBreakdown = CommonProviderListParameter<EarningTierModel>(list: [], notify: notify);
    availablePayout = CommonProviderPrimitiveParameter<double>(value: 0.0, notify: notify);
    pendingBalance = CommonProviderPrimitiveParameter<double>(value: 0.0, notify: notify);
  }

  late CommonProviderPrimitiveParameter<bool> isLoading;
  late CommonProviderPrimitiveParameter<double> totalEarnings;
  late CommonProviderPrimitiveParameter<double> growthPercentage;
  late CommonProviderListParameter<double> monthlyEarnings;
  late CommonProviderListParameter<double> earningsData; // Add this
  late CommonProviderListParameter<String> periods;
  late CommonProviderListParameter<EarningTierModel> tierBreakdown;
  late CommonProviderPrimitiveParameter<double> availablePayout;
  late CommonProviderPrimitiveParameter<double> pendingBalance;
}
