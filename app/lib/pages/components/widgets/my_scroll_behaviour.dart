import 'package:flutter/material.dart';

class MyScrollBehavior extends ScrollBehavior {
  const MyScrollBehavior();

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) {
    switch (getPlatform(context)) {
      case TargetPlatform.iOS:
        return const BouncingScrollPhysics();
      case TargetPlatform.macOS:
      case TargetPlatform.android:
        return const ClampingScrollPhysics();
      case TargetPlatform.fuchsia:
      case TargetPlatform.linux:
      case TargetPlatform.windows:
    }
    return const ClampingScrollPhysics();
  }
}
