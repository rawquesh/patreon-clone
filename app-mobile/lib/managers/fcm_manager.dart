import 'dart:async'; // Import for StreamSubscription
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:patreon_clone/constants/shared_preference_constants.dart';

import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/managers/shared_pref_manager.dart';
import 'package:patreon_clone/navigation/direct_navigator.dart';
import 'package:patreon_clone/backend/notification/notification_repository.dart';

import 'package:patreon_clone/pages/user/home/components/custom_bottom_bar.dart';

class NotificationManager {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotificationsPlugin = FlutterLocalNotificationsPlugin();

  DateTime? _lastNotificationTapTime;

  // Private constructor and static instance for Singleton pattern
  NotificationManager._();

  static final NotificationManager _instance = NotificationManager._();

  static NotificationManager get instance => _instance;

  bool _isInitialized = false;

  // Stream Subscriptions to manage listeners
  StreamSubscription<String>? _onTokenRefreshSubscription;
  StreamSubscription<RemoteMessage>? _onMessageSubscription;
  StreamSubscription<RemoteMessage>? _onMessageOpenedAppSubscription;

  Future<void> initialize() async {
    if (_isInitialized) {
      MyPrint.printOnConsole("NotificationService: NotificationService already initialized.");
      return;
    }

    await _requestPermission();
    await _initializeLocalNotifications();

    final fcmToken = await getFcmToken();
    if (fcmToken != null) {
      MyPrint.printOnConsole("NotificationService: 📱 Current FCM Token: $fcmToken");
      await _handleTokenUpdate(fcmToken);
    }
    // Store the subscription
    _onTokenRefreshSubscription = _firebaseMessaging.onTokenRefresh.listen(_handleTokenUpdate);
    _setupMessageHandlers();

    if (kDebugMode) subscribeToTopic("test");

    _isInitialized = true;
    MyPrint.printOnConsole("NotificationService: ✅ NotificationService Initialized");
  }

  Future<void> dispose() async {
    if (!_isInitialized) {
      MyPrint.printOnConsole("NotificationService: NotificationService not initialized, no need to dispose.");
      return;
    }
    MyPrint.printOnConsole("NotificationService: Disposing NotificationService...");

    await _onTokenRefreshSubscription?.cancel();
    await _onMessageSubscription?.cancel();
    await _onMessageOpenedAppSubscription?.cancel();

    if (kDebugMode) await unsubscribeFromTopic("test");

    await _firebaseMessaging.deleteToken();

    _isInitialized = false;
    _lastNotificationTapTime = null;

    MyPrint.printOnConsole("NotificationService: 🗑️ NotificationService Disposed");
  }

  void _setupMessageHandlers() {
    // Store the subscriptions
    _onMessageSubscription = FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      MyPrint.printOnConsole('🔔 Got a message whilst in the foreground!');
      MyPrint.printOnConsole('Foreground Message Data: ${message.data}');
      if (message.notification != null) {
        _showLocalNotification(message);
      }
    });

    _onMessageOpenedAppSubscription = FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageClick);
    _firebaseMessaging.getInitialMessage().then(_handleMessageClick);
  }

  void _handleNotificationTap(Map<String, dynamic> data) {
    MyPrint.printOnConsole("NotificationService: ✅ Handling tap with data: $data");

    final now = DateTime.now();

    if (_lastNotificationTapTime != null && now.difference(_lastNotificationTapTime!).inSeconds < 2) {
      MyPrint.printOnConsole("NotificationService: 🚫 Skipping tap, too soon (less than 2s ago).");
      return;
    }

    _lastNotificationTapTime = now;

    // Extract data with correct field names based on your logs
    final String? postId = data['postId'];
    final String? chatId = data['chatId'] ?? data['conversationId']; // Try both fields
    final String? notificationType = data['type'] ?? data['notification_type']; // Try both fields
    final String? link = data['link'];
    final String? actorId = data['actorId'];
    final String? senderId = data['senderId'];

    MyPrint.printOnConsole(
        "NotificationService: PostID: $postId, ChatID: $chatId, Type: $notificationType, Link: $link, ActorId: $actorId, SenderId: $senderId");

    // Handle navigation based on notification type
    if (notificationType != null) {
      switch (notificationType.toUpperCase()) {
        case 'POST_LIKE':
        case 'NEW_COMMENT':
        case 'LIKED':
        case 'COMMENTED':
        case 'COMMENT_REPLY':
        case 'NEW_POST':
          // For post-related notifications
          if (postId != null && postId.isNotEmpty) {
            MyPrint.printOnConsole("NotificationService: Navigating to post: $postId");
            DirectNavigator.navigateToPostDetails(postId);
          } else if (link != null && link.contains('/post/')) {
            // Extract postId from link
            String extractedPostId = link.split('/post/').last;
            MyPrint.printOnConsole("NotificationService: Navigating to post from link: $extractedPostId");
            DirectNavigator.navigateToPostDetails(extractedPostId);
          } else {
            MyPrint.printOnConsole("NotificationService: Post notification missing postId");
          }
          break;

        case 'CHAT_MESSAGE':
        case 'GROUP_CHAT_CREATED':
          if (chatId != null && chatId.isNotEmpty) {
            MyPrint.printOnConsole("NotificationService: Navigating to group chat: $chatId");
            DirectNavigator.navigateToChat(chatId, isGroupChat: true);
          } else {
            DirectNavigator.navigateToMessagingTab(isGroupChat: true);
          }
          break;

        case 'DIRECT_MESSAGE':
        case 'DIRECT_CHAT_CREATED':
          DirectNavigator.navigateToTab(HomePageTabs.community, messagingTabIndex: 1);
          break;

        default:
          MyPrint.printOnConsole("NotificationService: Unknown notification type: $notificationType");
          break;
      }
    } else if (link != null && link.isNotEmpty) {
      // Fallback to link-based navigation
      MyPrint.printOnConsole("NotificationService: Using link field for navigation: $link");
      _navigateUsingLink(link);
    } else {
      MyPrint.printOnConsole("NotificationService: No valid navigation data found in notification");
    }
  }

  /// Navigate using the link field from notification data
  void _navigateUsingLink(String link) {
    try {
      MyPrint.printOnConsole("NotificationService: Parsing link: $link");

      if (link.contains('/post/')) {
        String postId = link.split('/post/').last.split('?').first; // Remove query params
        MyPrint.printOnConsole("NotificationService: Link indicates post navigation: $postId");
        DirectNavigator.navigateToPostDetails(postId);
      } else if (link.contains('/chat/')) {
        String chatId = link.split('/chat/').last.split('?').first; // Remove query params
        MyPrint.printOnConsole("NotificationService: Link indicates group chat navigation: $chatId");
        DirectNavigator.navigateToChat(chatId, isGroupChat: true);
      } else if (link.contains('/direct-messages/')) {
        String chatId = link.split('/direct-messages/').last.split('?').first; // Remove query params
        MyPrint.printOnConsole("NotificationService: Link indicates direct message navigation: $chatId");
        DirectNavigator.navigateToChat(chatId, isGroupChat: false);
      } else if (link.contains('/profile/')) {
        // Handle profile links - extract chat ID from the end
        List<String> segments = link.split('/');
        if (segments.length > 2) {
          String chatId = segments.last;
          bool isGroupChat = link.contains('/chat/');
          MyPrint.printOnConsole("NotificationService: Profile link navigation - ChatID: $chatId, isGroupChat: $isGroupChat");
          DirectNavigator.navigateToChat(chatId, isGroupChat: isGroupChat);
        }
      } else {
        MyPrint.printOnConsole("NotificationService: Unknown link pattern: $link");
      }
    } catch (e) {
      MyPrint.printOnConsole("NotificationService: Error parsing link: $link, Error: $e");
    }
  }

  void _handleMessageClick(RemoteMessage? message) {
    if (message == null) return;
    MyPrint.printOnConsole('📲 Notification Tapped Data (background/terminated): ${message.data}');
    _handleNotificationTap(message.data);
  }

  Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@drawable/ic_notification');
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings();
    const InitializationSettings initializationSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        if (response.payload != null && response.payload!.isNotEmpty) {
          final Map<String, dynamic> data = jsonDecode(response.payload!);
          _handleNotificationTap(data);
        }
      },
    );

    await _localNotificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(const AndroidNotificationChannel(
          'high_importance_channel',
          'High Importance Notifications',
          description: 'This channel is used for important notifications.',
          importance: Importance.max,
        ));
  }

  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    const platformDetails = NotificationDetails(
      android: AndroidNotificationDetails(
        'high_importance_channel',
        'High Importance Notifications',
        channelDescription: 'This channel is used for important notifications.',
        importance: Importance.max,
        priority: Priority.high,
        icon: '@drawable/ic_notification',
      ),
      iOS: DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );

    await _localNotificationsPlugin.show(
      notification.hashCode,
      notification.title,
      notification.body,
      platformDetails,
      payload: jsonEncode(message.data),
    );
  }

  Future<void> _handleTokenUpdate(String newToken) async {
    try {
      final storedToken = await SharedPrefManager().getString(SharedPreferenceConstants.fcmToken);
      if (storedToken == null || storedToken != newToken) {
        await NotificationRepository().uploadDeviceToken(newToken);
      } else {
        MyPrint.printOnConsole("NotificationService: ✅ Token is up to date.");
      }
    } catch (e) {
      MyPrint.printOnConsole("NotificationService: ❌ Error in _handleTokenUpdate: $e");
    }
  }

  Future<void> _requestPermission() async {
    await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
  }

  Future<String?> getFcmToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      MyPrint.printOnConsole("NotificationService: ❌ Failed to get FCM token: $e");
      return null;
    }
  }

  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }
}
