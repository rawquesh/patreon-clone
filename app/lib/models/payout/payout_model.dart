import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

class PayoutModel {
  String id;
  double amount;
  String status;
  DateTime? createdAt;
  DateTime? arrivalDate;
  String description;
  String method;
  String type;

  PayoutModel({
    this.id = '',
    this.amount = 0.0,
    this.status = '',
    this.createdAt,
    this.arrivalDate,
    this.description = '',
    this.method = '',
    this.type = '',
  });

  factory PayoutModel.fromMap(Map<String, dynamic> map) {
    return PayoutModel(
      id: ParsingHelper.parseStringMethod(map['id']),
      amount: ParsingHelper.parseDoubleMethod(map['amount']),
      status: ParsingHelper.parseStringMethod(map['status']),
      createdAt: ParsingHelper.parseDateTimeMethod(map['createdAt']),
      arrivalDate: ParsingHelper.parseDateTimeMethod(map['arrivalDate']),
      description: ParsingHelper.parseStringMethod(map['description']),
      method: ParsingHelper.parseStringMethod(map['method']),
      type: ParsingHelper.parseStringMethod(map['type']),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'amount': amount,
      'status': status,
      'createdAt': createdAt?.toIso8601String(),
      'arrivalDate': arrivalDate?.toIso8601String(),
      'description': description,
      'method': method,
      'type': type,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}
