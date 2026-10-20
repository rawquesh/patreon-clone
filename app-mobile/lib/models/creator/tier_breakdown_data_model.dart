import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';

class TierBreakdownModel {
  String id;
  String name;
  int count;
  double monthlyRate;

  TierBreakdownModel({
    this.id = '',
    this.name = '',
    this.count = 0,
    this.monthlyRate = 0.0,
  });

  factory TierBreakdownModel.fromMap(Map<String, dynamic> map) {
    return TierBreakdownModel(
      id: map['id'] != null ? ParsingHelper.parseStringMethod(map['id']) : '',
      name: map['name'] != null ? ParsingHelper.parseStringMethod(map['name']) : '',
      count: map['count'] != null ? ParsingHelper.parseIntMethod(map['count']) : 0,
      monthlyRate: map['monthlyRate'] != null ? ParsingHelper.parseDoubleMethod(map['monthlyRate']) : 0.0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'count': count,
      'monthlyRate': monthlyRate,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}