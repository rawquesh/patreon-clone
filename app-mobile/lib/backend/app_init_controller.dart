import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';
import 'package:patreon-clone/constants/app_constants.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/styles/theme_provider.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_utils.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';
import 'package:patreon-clone/backend/post/my_post_controller.dart';

import 'authentication/authentication_controller.dart';
import 'authentication/authentication_provider.dart';
import 'common/app_controller.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';
import 'package:patreon-clone/styles/theme_controller.dart';
import 'package:patreon-clone/backend/post/liked_posts_controller.dart';
import 'package:patreon-clone/backend/post/liked_posts_provider.dart';
import 'common/dependency_injection.dart';

class AppInitController {
  static bool isNavigateToObBoardingScreen = false;
  static bool isNavigateToSubSite = false;

  Future<bool> checkNavigateToOnBoardingScreen() async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("AppInitController().checkNavigateToOnBoardingScreen() called", tag: tag);

    isNavigateToObBoardingScreen = false;

    bool? isFirst = await SharedPrefManager().getBool(SharedPreferenceConstants.isFirst);
    MyPrint.printOnConsole("isFirst:$isFirst", tag: tag);
    if (isFirst != false) {
      SharedPrefManager().setBool(SharedPreferenceConstants.isFirst, false);
      SharedPrefManager().setInt(SharedPreferenceConstants.lastOpenedTime, DateTime.now().millisecondsSinceEpoch);

      isNavigateToObBoardingScreen = true;
    }

    MyPrint.printOnConsole("Final isNavigateToObBoardingScreen:$isNavigateToObBoardingScreen", tag: tag);

    return isNavigateToObBoardingScreen;
  }

  Future<void> initApp() async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("AppInitController().initApp() called", tag: tag);

    // AppController.flavor = appFlavor;
    AppController.appType = AppTypes.user;

    List<Future> futures = [];

    // Simplified to only set orientation
    futures.add(
      SystemChrome.setPreferredOrientations(<DeviceOrientation>[
        DeviceOrientation.portraitUp,
      ]),
    );

    AppThemeProvider themeProvider = DependencyInjection.appThemeProvider;
    AppThemeController themeController = AppThemeController(appThemeProvider: themeProvider);
    futures.add(themeController.init());

    await Future.wait(futures);

    // MyPrint.printOnConsole('Running $appFlavor version...');
    MyPrint.printOnConsole("AppInitController().initApp() Completed", tag: tag);
  }

  Future<void> getAllAppData({required BuildContext context, bool isNavigatedToOnBoardingScreen = false}) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("AppInitController().getAllAppData() called", tag: tag);

    await Future.wait([
      loadAssetImages(context: context),
    ]);

    MyPrint.printOnConsole("All Data Getting Completed", tag: tag);
  }

  Future<void> performInitialAppOpeningOperations({
    required BuildContext context,
    bool isNavigatedToOnBoardingScreen = false,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("AppInitController().performInitialAppOpeningOperations() called", tag: tag);

    if (isNavigatedToOnBoardingScreen) {
      return;
    }

    AuthenticationProvider authenticationProvider = DependencyInjection.authenticationProvider;
    AuthenticationController authenticationController = DependencyInjection.authenticationController;

    String? userId = await SharedPrefManager().getString('user_id');
    String? authToken = await SharedPrefManager().getString('auth_token');

    MyPrint.printOnConsole("Stored credentials - userId: $userId, authToken: ${authToken != null && authToken.isNotEmpty}",
        tag: tag);

    bool isUserLoggedIn = await authenticationController.isUserLoggedIn();
    MyPrint.printOnConsole("isUserLoggedIn:$isUserLoggedIn", tag: tag);

    if (!isUserLoggedIn) {
      MyPrint.printOnConsole(
        "Returning from AppInitController().performInitialAppOpeningOperations() because Navigated to Login Screen",
        tag: tag,
      );

      context.goNamed(Routes.login);
      return;
    }

    // Initialize liked posts from local storage
    LikedPostsProvider likedProvider = DependencyInjection.likedPostsProvider;
    LikedPostsController likedController = LikedPostsController(
      likedPostsProvider: likedProvider,
      myPostController: MyPostController(postProvider: DependencyInjection.postProvider),
    );
    await likedController.init();

    // User is logged in, check if profile exists
    // bool isExist = await authenticationController.checkUserWithIdExistOrNotAndIfNotExistThenCreate(
    //   userId: authenticationProvider.userId.get(),
    // );

    UserModel? userModel = authenticationProvider.userModel.get();
    bool isCreatorMode = await SharedPrefManager().getBool(SharedPreferenceConstants.isCreatorMode) ?? false;

    if (userModel != null) {
      // if (userModel != null && (userModel.firstName.isEmpty || userModel.isDeleted || !isExist)) {
      // User exists but needs to complete profile
      if (isCreatorMode && userModel.isCreator == true) {
        await context.pushNamed(Routes.creatorMain);
        return;
      } else {
        context.goNamed(Routes.main);
        return;
      }
    }

    // User is fully logged in with complete profile, navigate to main screen
    if (isCreatorMode && (userModel?.isCreator == true)) {
      await context.pushNamed(Routes.creatorMain);
    } else {
      context.goNamed(Routes.main);
    }
  }

  Future<void> loadAssetImages({required BuildContext context}) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("AppInitController().loadAssetImages() called", tag: tag);

    List<String> assetImagesToPreCache = <String>[
      AppAssets.onBoardingSubImage1,
      AppAssets.onBoardingSubImage2,
      AppAssets.onBoardingSubImage3,
      AppAssets.onBoardingNextButton,
      AppAssets.patreon-cloneLogo,
    ];
    MyPrint.printOnConsole("assetImagesToPreCache:$assetImagesToPreCache", tag: tag);

    await Future.wait(assetImagesToPreCache.map((element) => precacheImage(AssetImage(element), context)));

    MyPrint.printOnConsole("AppInitController().loadAssetImages() Completed", tag: tag);
  }
}
