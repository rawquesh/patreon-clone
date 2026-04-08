import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';

class MemberModel {
  String id;
  String status;
  DateTime? currentPeriodEnd;
  String name;
  String email;
  String profilePicture;
  MembershipModel? tier;
  DateTime? joinDate;
  double totalPaid;

  MemberModel({this.id = '', this.status = '', this.currentPeriodEnd, this.name = '', this.email = '', this.profilePicture = '', this.tier, this.joinDate, this.totalPaid = 0.0});

  factory MemberModel.fromMap(Map<String, dynamic> map) {
    return MemberModel(
      id: ParsingHelper.parseStringMethod(map['_id'] ?? map['id']),
      status: ParsingHelper.parseStringMethod(map['status']),
      currentPeriodEnd: ParsingHelper.parseDateTimeMethod(map['currentPeriodEnd']),
      name: ParsingHelper.parseStringMethod(map['name']),
      email: ParsingHelper.parseStringMethod(map['email']),
      profilePicture: ParsingHelper.parseStringMethod(map['profilePicture']),
      tier: map['tier'] != null && map['tier'] is Map<String, dynamic> ? MembershipModel.fromMap(ParsingHelper.parseMapMethod(map['tier'])) : null,
      joinDate: ParsingHelper.parseDateTimeMethod(map['joinDate']),
      totalPaid: ParsingHelper.parseDoubleMethod(map['totalPaid']),
    );
  }

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      'id': id,
      'status': status,
      'currentPeriodEnd': toJson ? currentPeriodEnd?.toIso8601String() : currentPeriodEnd,
      'name': name,
      'email': email,
      'profilePicture': profilePicture,
      'tier': tier?.toMap(),
      'joinDate': toJson ? joinDate?.toIso8601String() : joinDate,
      'totalPaid': totalPaid,
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap(toJson: true));
}
