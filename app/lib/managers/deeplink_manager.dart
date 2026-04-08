import 'dart:async';
import 'package:flutter/material.dart';
import 'package:app_links/app_links.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/navigation/direct_navigator.dart';

/// A singleton class to handle deep linking logic.
class DeepLinkManager {
  // --- Singleton Setup ---
  static final DeepLinkManager _instance = DeepLinkManager._internal();
  factory DeepLinkManager() => _instance;
  DeepLinkManager._internal();

  final _appLinks = AppLinks();
  StreamSubscription<Uri>? _linkSubscription;

  DateTime? _lastTapTime;

  /// Call this method to stop listening to deep links.
  void dispose() {
    _lastTapTime = null;
    _linkSubscription?.cancel();
  }

  /// Initializes the deep link handling.
  ///
  /// Must be called with a [BuildContext] that has a [Navigator].
  Future<void> init(BuildContext context) async {
    // Handle initial link when app is opened from terminated state
    // final initialLink = await _appLinks.getInitialLink();
    // if (initialLink != null) {
    //   _navigateTo(context, initialLink);
    // }

    _linkSubscription = _appLinks.uriLinkStream.listen((uri) {
      MyPrint.printOnConsole("DeepLinkHandler: Received URI: $uri at ${DateTime.now()}");
      _navigateTo(context, uri);
    });
  }

  /// Parses the URI and navigates to the appropriate screen.
  void _navigateTo(BuildContext context, Uri uri) {
    final now = DateTime.now();

    if (_lastTapTime != null && now.difference(_lastTapTime!).inSeconds < 2) {
      MyPrint.printOnConsole("DeepLinkHandler: 🚫 Skipping tap, too soon (less than 2s ago).");
      return;
    }

    _lastTapTime = now;

    MyPrint.printOnConsole("DeepLinkHandler: Processing URI: $uri");
    MyPrint.printOnConsole("DeepLinkHandler: Path segments: ${uri.pathSegments}");
    MyPrint.printOnConsole("DeepLinkHandler: Query parameters: ${uri.queryParameters}");

    if (uri.pathSegments.length >= 2) {
      final type = uri.pathSegments[0];
      final id = uri.pathSegments.last;

      MyPrint.printOnConsole("DeepLinkHandler: Type: $type, ID: $id");

      switch (type) {
        case 'post':
          MyPrint.printOnConsole("DeepLinkHandler: Navigating to post: $id");
          DirectNavigator.navigateToPostDetails(id);
          break;

        case 'creator':
          MyPrint.printOnConsole("DeepLinkHandler: Creator navigation not implemented for ID: $id");
          DirectNavigator.navigateToCreatorPage(id);

          break;

        case 'profile':
          _handleProfileNavigation(uri, id);
          break;

        // Add more cases here for other types like 'user', 'event', etc.
        default:
          MyPrint.printOnConsole("DeepLinkHandler: Unknown navigation type: $type");
          break;
      }
    } else {
      MyPrint.printOnConsole("DeepLinkHandler: Invalid URI structure: ${uri.pathSegments}");
    }
  }

  /// Handles profile-related navigation
  void _handleProfileNavigation(Uri uri, String id) {
    if (uri.pathSegments.length >= 3) {
      final subType = uri.pathSegments[2];
      MyPrint.printOnConsole("DeepLinkHandler: Profile subtype: $subType, ID: $id");

      switch (subType) {
        case 'chat':
          MyPrint.printOnConsole("DeepLinkHandler: Navigating to group chat: $id");
          DirectNavigator.navigateToChat(id, isGroupChat: true);
          break;

        case 'direct-messages':
          MyPrint.printOnConsole("DeepLinkHandler: Navigating to direct message: $id");
          DirectNavigator.navigateToChat(id, isGroupChat: false);
          break;

        default:
          MyPrint.printOnConsole("DeepLinkHandler: Unknown profile subtype: $subType");
          break;
      }
    } else {
      MyPrint.printOnConsole("DeepLinkHandler: Invalid profile URI structure");
    }
  }
}
