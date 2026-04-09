import 'package:patreon-clone/config/index.dart';

class AppTypes {
  static const String user = "user";
  static const String admin = "admin";
  static const String withdraw = "withdraw";
}

class DiscountApplicableTo {
  static const String all = "all";
  static const String selected = "selected";
}

class GiftsApplicableTo {
  static const String all = "all";
  static const String selected = "selected";
}

class AppAssets {
  //folders
  static const String onboardingFolder = 'assets/onboarding';
  static const String imagesFolder = 'assets/images';
  static const String iconsFolder = 'assets/icons';
  static const String lottiesFolder = 'assets/lotties';

  //onboarding
  static const String onBoardingSubImage1 = '$onboardingFolder/onboard_sub_1.png';
  static const String onBoardingSubImage2 = '$onboardingFolder/onboard_sub_2.png';
  static const String onBoardingSubImage3 = '$onboardingFolder/onboard_sub_3.png';
  static const String onBoardingNextButton = '$onboardingFolder/onboarding_next_button.png';

  //images
  static const String loginHeader = '$imagesFolder/login_header.png';
  static const String otpHeader = '$imagesFolder/otp_header.png';
  static const String signupBanner = '$imagesFolder/signupBanner.png';
  static const String patreon-cloneLogo = AppConfig.logoAssetPath;
  static const String male = '$imagesFolder/male.png';
  static const String communityPolicyIcon = '$imagesFolder/community_policy_icon.png';
  static const String featureRequestIcon = '$imagesFolder/feature_request_icon.png';
  static const String helpcenterFaqIcon = '$imagesFolder/helpcenter_faq_icon.png';
  static const String newsIcon = '$imagesFolder/news_icon.png';
  static const String termsOfServiceIcon = '$imagesFolder/terms_of_service_icon.png';
  static const String privacyPolicyIcon = '$imagesFolder/privacy_policy_icon.png';
  static const String logoutIcon = '$imagesFolder/logout_icon.png';
  static const String membershipIcon = '$imagesFolder/membership_icon.png';
  static const String create = '$imagesFolder/create.png';
  static const String bgImage = '$imagesFolder/bg_image.png';
  static const String moreIcon = '$imagesFolder/more_icon.png';
  static const String shareIcon = '$imagesFolder/share_icon.png';
  static const String addIcon = '$imagesFolder/add_icon.png';
  static const String editIcon = '$imagesFolder/edit_icon.png';

  //icons
  static const String shareIcon1 = '$iconsFolder/share_icon_1.png';
  static const String streakIcon = '$iconsFolder/streak_icon.png';

  // lotties
  static const String scanLotties = '$lottiesFolder/scan.json';
}
