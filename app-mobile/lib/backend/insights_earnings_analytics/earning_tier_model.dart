class EarningTierModel {
  String id;
  String name;
  double amount;
  int percentage;

  EarningTierModel({
    this.id = '',
    this.name = '',
    this.amount = 0.0,
    this.percentage = 0,
  });

  factory EarningTierModel.fromMap(Map<String, dynamic> map) {
    return EarningTierModel(
      id: map['id'] != null ? map['id'].toString() : '',
      name: map['name'] != null ? map['name'].toString() : '',
      amount: map['amount'] != null ? double.tryParse(map['amount'].toString()) ?? 0.0 : 0.0,
      percentage: map['percentage'] != null ? int.tryParse(map['percentage'].toString()) ?? 0 : 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'amount': amount,
      'percentage': percentage,
    };
  }
}