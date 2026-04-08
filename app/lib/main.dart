import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:patreon-clone/utils/extensions.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/firebase_options.dart';
import 'package:patreon-clone/pages/my_app.dart';

import 'backend/app_init_controller.dart';
import 'navigation/app_router.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  MyPrint.printOnConsole("Handling a background message: ${message.toMap()}");
}

Future<void> main() async {
  await runZonedGuarded<Future<void>>(
    () async {
      WidgetsFlutterBinding.ensureInitialized();
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

      AppInitController appInitController = AppInitController();

      await appInitController.initApp();

      runApp(const MyApp());

      BuildContext? context;
      while (context == null || (!context.checkMounted())) {
        context = AppRouter.rootNavigatorKey.currentContext;
        await Future.delayed(const Duration(milliseconds: 200));
      }

      await appInitController.performInitialAppOpeningOperations(context: context, isNavigatedToOnBoardingScreen: false);
    },
    (e, s) {
      MyPrint.printOnConsole("Error in runZonedGuarded:$e");
      MyPrint.printOnConsole(s);
    },
  );
}

// Future<void>? runErrorSafeApp() {
//   return runZonedGuarded<Future<void>>(
//     () async {
//       WidgetsFlutterBinding.ensureInitialized();
//       FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
//       await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

//       AppInitController appInitController = AppInitController();

//       await appInitController.initApp();

//       runApp(const MyApp());

//       BuildContext? context;
//       while (context == null || (!context.checkMounted())) {
//         context = AppRouter.rootNavigatorKey.currentContext;
//         await Future.delayed(const Duration(milliseconds: 200));
//       }

//       await appInitController.performInitialAppOpeningOperations(context: context, isNavigatedToOnBoardingScreen: false);
//     },
//     (e, s) {
//       MyPrint.printOnConsole("Error in runZonedGuarded:$e");
//       MyPrint.printOnConsole(s);
//     },
//   );
// }
