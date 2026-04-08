class MembershipChartPointModel {
  String label;
  double value;

  MembershipChartPointModel({
    this.label = '',
    this.value = 0.0,
  });

  factory MembershipChartPointModel.fromMap(Map<String, dynamic> map) {
    return MembershipChartPointModel(
      label: map['date'] != null ? map['date'].toString() : '',
      value: map['count'] != null
          ? double.tryParse(map['count'].toString()) ?? 0.0
          : 0.0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'date': label,
      'count': value,
    };
  }
}