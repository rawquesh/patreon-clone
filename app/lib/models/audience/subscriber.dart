import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';

class Subscriber {
  final String subscriptionId;
  final String subscriberId;
  final String firstName;
  final String lastName;
  final String email;
  final String profilePicture;
  final String membershipTier;
  final double monthlyRate;
  final DateTime subscribedSince;

  Subscriber({
    required this.subscriptionId,
    required this.subscriberId,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.profilePicture,
    required this.membershipTier,
    required this.monthlyRate,
    required this.subscribedSince,
  });

  factory Subscriber.fromMap(Map<String, dynamic> map) {
    return Subscriber(
      subscriptionId: ParsingHelper.parseStringMethod(map['subscriptionId']),
      subscriberId: ParsingHelper.parseStringMethod(map['subscriberId']),
      firstName: ParsingHelper.parseStringMethod(map['firstName']),
      lastName: ParsingHelper.parseStringMethod(map['lastName']),
      email: ParsingHelper.parseStringMethod(map['email']),
      profilePicture: ParsingHelper.parseStringMethod(map['profilePicture']),
      membershipTier: ParsingHelper.parseStringMethod(map['membershipTier']),
      monthlyRate: ParsingHelper.parseDoubleMethod(map['monthlyRate']),
      subscribedSince: ParsingHelper.parseDateTimeMethod(map['subscribedSince']) ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'subscriptionId': subscriptionId,
      'subscriberId': subscriberId,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'profilePicture': profilePicture,
      'membershipTier': membershipTier,
      'monthlyRate': monthlyRate,
      'subscribedSince': subscribedSince.toIso8601String(),
    };
  }

  @override
  String toString() => MyUtils.encodeJson(toMap());
}