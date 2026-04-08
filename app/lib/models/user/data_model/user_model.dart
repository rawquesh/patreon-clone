import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/helpers/parsing_helper.dart';
import 'package:patreon-clone/models/social_link/social_links.dart';

class UserModel {
  String userId;
  String firstName;
  String lastName;
  String displayName;
  String mobileNumber;
  String email;
  String password;
  String notificationToken;
  String profilePicture;
  String profileCover;
  String gender;
  String authenticationMode;
  int age;
  bool enabled;
  bool isDeleted;
  String country;
  String preferredContentGender;
  bool isCreator;
  String creatorUsername;
  String contentVisibleTo;
  String creatorCategory;
  String creatorHeadline;
  String creatorStatus;
  bool hasCompletedStripeOnboarding;
  String bio;
  String introVideoUrl;
  List<SocialLinkModel> socialLinks;
  bool memberNotifyOnNewPost;
  bool memberNotifyOnDirectMessages;
  bool creatorNotifyOnNewUserJoined;
  bool creatorNotifyOnCommentsAndRepliesOnPosts;
  bool creatorNotifyOnDirectMessages;

  UserModel({
    this.userId = "",
    this.firstName = "",
    this.lastName = "",
    this.displayName = "",
    this.mobileNumber = "",
    this.email = "",
    this.password = "",
    this.notificationToken = "",
    this.profilePicture = "",
    this.profileCover = "",
    this.gender = "",
    this.authenticationMode = "",
    this.age = 0,
    this.enabled = true,
    this.isDeleted = false,
    this.country = "",
    this.preferredContentGender = "",
    this.isCreator = false,
    this.creatorUsername = "",
    this.contentVisibleTo = "",
    this.creatorCategory = "",
    this.creatorHeadline = "",
    this.creatorStatus = "",
    this.hasCompletedStripeOnboarding = false,
    this.bio = "",
    this.introVideoUrl = "",
    this.socialLinks = const [],
    this.memberNotifyOnNewPost = false,
    this.memberNotifyOnDirectMessages = false,
    this.creatorNotifyOnNewUserJoined = false,
    this.creatorNotifyOnCommentsAndRepliesOnPosts = false,
    this.creatorNotifyOnDirectMessages = false,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      userId: ParsingHelper.parseStringMethod(map.containsKey("_id") ? map["_id"] : map["id"]),
      firstName: ParsingHelper.parseStringMethod(map["firstName"]),
      lastName: ParsingHelper.parseStringMethod(map["lastName"]),
      displayName:
      "${ParsingHelper.parseStringMethod(map["firstName"])} ${ParsingHelper
          .parseStringMethod(map["lastName"])}".trim(),
      mobileNumber: ParsingHelper.parseStringMethod(map["mobileNumber"]),
      email: ParsingHelper.parseStringMethod(map["email"]),
      password: ParsingHelper.parseStringMethod(map["password"]),
      notificationToken: ParsingHelper.parseStringMethod(
          map["notificationToken"]),
      profilePicture: ParsingHelper.parseStringMethod(map["profilePicture"]),
      profileCover: ParsingHelper.parseStringMethod(map["profileCover"]),
      gender: ParsingHelper.parseStringMethod(map["gender"]),
      authenticationMode: ParsingHelper.parseStringMethod(
          map["authenticationMode"]),
      age: ParsingHelper.parseIntMethod(map["age"]),
      enabled: ParsingHelper.parseBoolMethod(map["enabled"]),
      isDeleted: ParsingHelper.parseBoolMethod(map["isDeleted"]),
      country: ParsingHelper.parseStringMethod(map["countryOfResidence"]),
      preferredContentGender: ParsingHelper.parseStringMethod(
          map["genderPreference"]),
      isCreator: ParsingHelper.parseBoolMethod(map["isCreator"]),
      creatorUsername: ParsingHelper.parseStringMethod(map["creatorUsername"]),
      contentVisibleTo: ParsingHelper.parseStringMethod(
          map["contentVisibleTo"]),
      creatorCategory: ParsingHelper.parseStringMethod(map["creatorCategory"]),
      creatorHeadline: ParsingHelper.parseStringMethod(map["creatorHeadline"]),
      creatorStatus: ParsingHelper.parseStringMethod(map["creatorStatus"]),
      hasCompletedStripeOnboarding: ParsingHelper.parseBoolMethod(
          map["hasCompletedStripeOnboarding"]),
      bio: ParsingHelper.parseStringMethod(map["bio"]),
      introVideoUrl: ParsingHelper.parseStringMethod(map["introVideoUrl"]),
      socialLinks: map['socialLinks'] != null && map['socialLinks'] is List
          ? (map['socialLinks'] as List)
          .map((e) => SocialLinkModel.fromMap(Map<String, dynamic>.from(e)))
          .toList()
          : const [],
      memberNotifyOnNewPost: ParsingHelper.parseBoolMethod(
          map["memberNotifyOnNewPost"]),
      memberNotifyOnDirectMessages: ParsingHelper.parseBoolMethod(
          map["memberNotifyOnDirectMessages"]),
      creatorNotifyOnNewUserJoined: ParsingHelper.parseBoolMethod(
          map["creatorNotifyOnNewMember"]),
      creatorNotifyOnCommentsAndRepliesOnPosts: ParsingHelper.parseBoolMethod(
          map["creatorNotifyOnComments"]),
      creatorNotifyOnDirectMessages: ParsingHelper.parseBoolMethod(
          map["creatorNotifyOnDirectMessages"]),
    );
  }

  void updateFromMap(Map<String, dynamic> map) {
    final updated = UserModel.fromMap(map);
    userId = updated.userId;
    firstName = updated.firstName;
    lastName = updated.lastName;
    displayName = updated.displayName;
    mobileNumber = updated.mobileNumber;
    email = updated.email;
    password = updated.password;
    notificationToken = updated.notificationToken;
    profilePicture = updated.profilePicture;
    profileCover = updated.profileCover;
    gender = updated.gender;
    authenticationMode = updated.authenticationMode;
    age = updated.age;
    enabled = updated.enabled;
    isDeleted = updated.isDeleted;
    country = updated.country;
    preferredContentGender = updated.preferredContentGender;
    isCreator = updated.isCreator;
    creatorUsername = updated.creatorUsername;
    contentVisibleTo = updated.contentVisibleTo;
    creatorCategory = updated.creatorCategory;
    creatorHeadline = updated.creatorHeadline;
    creatorStatus = updated.creatorStatus;
    hasCompletedStripeOnboarding = updated.hasCompletedStripeOnboarding;
    bio = updated.bio;
    introVideoUrl = updated.introVideoUrl;
    socialLinks = updated.socialLinks;
    memberNotifyOnNewPost = updated.memberNotifyOnNewPost;
    memberNotifyOnDirectMessages = updated.memberNotifyOnDirectMessages;
    creatorNotifyOnNewUserJoined = updated.creatorNotifyOnNewUserJoined;
    creatorNotifyOnCommentsAndRepliesOnPosts = updated.creatorNotifyOnCommentsAndRepliesOnPosts;
    creatorNotifyOnDirectMessages = updated.creatorNotifyOnDirectMessages;
  }

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      "id": userId,
      "firstName": firstName,
      "lastName": lastName,
      "displayName": displayName,
      "mobileNumber": mobileNumber,
      "email": email,
      "password": password,
      "notificationToken": notificationToken,
      "profilePicture": profilePicture,
      "profileCover": profileCover,
      "gender": gender,
      "authenticationMode": authenticationMode,
      "age": age,
      "enabled": enabled,
      "isDeleted": isDeleted,
      "countryOfResidence": country,
      "preferredContentGender": preferredContentGender,
      "isCreator": isCreator,
      "creatorUsername": creatorUsername,
      "contentVisibleTo": contentVisibleTo,
      "creatorCategory": creatorCategory,
      "creatorHeadline": creatorHeadline,
      "creatorStatus": creatorStatus,
      "hasCompletedStripeOnboarding": hasCompletedStripeOnboarding,
      "bio": bio,
      "introVideoUrl": introVideoUrl,
      "socialLinks": socialLinks.map((e) => e.toMap()).toList(),
      "memberNotifyOnNewPost": memberNotifyOnNewPost,
      "memberNotifyOnDirectMessages": memberNotifyOnDirectMessages,
      "creatorNotifyOnNewMember": creatorNotifyOnNewUserJoined,
      "creatorNotifyOnComments": creatorNotifyOnCommentsAndRepliesOnPosts,
      "creatorNotifyOnDirectMessages": creatorNotifyOnDirectMessages,
    };
  }

  @override
  String toString() {
    return MyUtils.encodeJson(toMap(toJson: true));
  }
}
