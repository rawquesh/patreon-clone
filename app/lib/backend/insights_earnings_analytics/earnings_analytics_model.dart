import 'earning_tier_model.dart';

class EarningsAnalyticsModel {
  double totalEarnings;
  double growthPercentage;
  List<double> monthlyEarnings;
  List<String> periods;
  List<EarningTierModel> tierBreakdown;
  double availablePayout;
  double pendingBalance;

  EarningsAnalyticsModel({
    this.totalEarnings = 0.0,
    this.growthPercentage = 0.0,
    this.monthlyEarnings = const [],
    this.periods = const [],
    this.tierBreakdown = const [],
    this.availablePayout = 0.0,
    this.pendingBalance = 0.0,
  });

  factory EarningsAnalyticsModel.fromMap(Map<String, dynamic> map) {
    // Parse list fields if present
    List<double> monthly = (map['monthlyEarnings'] is List)
        ? List<double>.from((map['monthlyEarnings'] as List)
        .map((e) => double.tryParse(e.toString()) ?? 0.0))
        : <double>[];

    List<String> per = (map['periods'] is List)
        ? List<String>.from((map['periods'] as List).map((e) => e.toString()))
        : <String>[];

    // Fallback: derive lists from earningsData map
    if ((map['earningsData'] is Map) && (monthly.isEmpty || per.isEmpty)) {
      final dataMap = Map<String, dynamic>.from(map['earningsData']); // preserves order
      per = <String>[];
      monthly = <double>[];
      dataMap.forEach((k, v) {
        per.add(k);
        monthly.add(double.tryParse(v.toString()) ?? 0.0);
      });
    }

    return EarningsAnalyticsModel(
      totalEarnings: map['totalEarnings'] != null ? double.tryParse(map['totalEarnings'].toString()) ?? 0.0 : 0.0,
      growthPercentage: map['growthPercentage'] != null ? double.tryParse(map['growthPercentage'].toString()) ?? 0.0 : 0.0,
      monthlyEarnings: monthly,
      periods: per,
      tierBreakdown: map['tierBreakdown'] is List
          ? (map['tierBreakdown'] as List)
          .map((e) => EarningTierModel.fromMap(Map<String, dynamic>.from(e)))
          .toList()
          : const [],
      availablePayout: map['availablePayout'] != null ? double.tryParse(map['availablePayout'].toString()) ?? 0.0 : 0.0,
      pendingBalance: map['pendingBalance'] != null ? double.tryParse(map['pendingBalance'].toString()) ?? 0.0 : 0.0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'totalEarnings': totalEarnings,
      'growthPercentage': growthPercentage,
      'monthlyEarnings': monthlyEarnings,
      'periods': periods,
      'tierBreakdown': tierBreakdown.map((e) => e.toMap()).toList(),
      'availablePayout': availablePayout,
      'pendingBalance': pendingBalance,
    };
  }
}