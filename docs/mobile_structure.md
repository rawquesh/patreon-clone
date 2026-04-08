# Patreon Clone Mobile App — Codebase Structure & Architecture

> A complete technical reference for the Flutter mobile application. This document covers the tech stack, folder structure, design patterns, data flow, and core workflows.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Folder & File Structure](#2-folder--file-structure)
3. [Navigation & Routing](#3-navigation--routing)
4. [State Management](#4-state-management)
5. [API & Service Layer](#5-api--service-layer)
6. [Authentication](#6-authentication)
7. [Data Models](#7-data-models)
8. [Managers & Services](#8-managers--services)
9. [Design Patterns](#9-design-patterns)
10. [Core Workflows & Data Flow](#10-core-workflows--data-flow)
11. [Key Files Reference](#11-key-files-reference)
12. [Constants, Helpers & Utilities](#12-constants-helpers--utilities)
13. [Theming](#13-theming)

---

## 1. Technology Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | Flutter | 3.x (Dart SDK `^3.6.1`) |
| **Language** | Dart | — |
| **Routing** | `go_router` | 17.0.1 |
| **State Management** | `provider` | 6.1.2 |
| **HTTP Client** | `http` | 1.2.0 |
| **Real-time Chat** | `socket_io_client` | 3.1.2 |
| **Local Database** | `hive` | 2.2.3 |
| **Preferences** | `shared_preferences` | 2.3.5 |
| **Push Notifications** | `firebase_messaging` | 16.0.0 |
| **Image Handling** | `image_picker` + `image_cropper` + `flutter_image_compress` | various |
| **Video Handling** | `video_player` + `chewie` + `video_compress` + `video_trimmer` | various |
| **Charts** | `fl_chart` | 1.0.0 |
| **Deep Linking** | `app_links` | 6.4.1 |
| **Maps** | `google_maps_flutter` | (present in pubspec) |
| **Theming** | Custom `ThemeData` + `google_fonts` | — |
| **Analytics** | `firebase_analytics` + `amplitude_flutter` | — |

**Build targets**: Android, iOS, Linux, macOS, Windows, Web.
**App internal name**: `patreon-clone`. Display name: **Patreon Clone**.
**Version**: 1.1.0+110.

---

## 2. Folder & File Structure

```
app-mobile/
|
|-- android/          Android native project (Kotlin, Gradle)
|-- ios/              iOS native project (Swift, Xcode)
|-- linux/            Linux desktop
|-- macos/            macOS desktop
|-- web/              Web platform
|-- windows/          Windows desktop
|-- assets/           Static assets (fonts, images)
|-- lib/              Dart source code (all app logic)
|-- test/             Unit and widget tests
|-- pubspec.yaml      Dependencies, metadata, font definitions
|-- analysis_options.yaml
|-- .fvmrc            Flutter SDK version pin
|-- firebase_options.dart
```

### `lib/` Source Tree (Feature-Domain Layered)

```
lib/
|
|-- main.dart                    App entry point
|-- firebase_options.dart        Firebase platform configs
|
|-- constants/                   All app-wide constants (barrel export)
|   |-- api_constants.dart       Base URLs, app types, asset paths
|   |-- app_constants.dart       App assets, onboarding assets
|   |-- auth_constants.dart       Auth mode constants (google, apple, etc.)
|   |-- chat_constants.dart       Chat-related constants
|   |-- data_constants.dart       General data constants
|   |-- notification_constants.dart
|   |-- post_constants.dart       Post type constants
|   |-- shared_preference_constants.dart   SharedPrefs key names
|   |-- ui_constants.dart         Spacing, sizing constants
|   |-- user_constants.dart
|   |-- constants.dart            Barrel re-export
|
|-- helpers/                     Utility helpers
|   |-- encryption_helper.dart    AES encryption
|   |-- image_helper.dart        Pick → crop → compress pipeline
|   |-- parsing_helper.dart      Safe dynamic type conversion
|
|-- managers/                    Singleton service managers
|   |-- deeplink_manager.dart    Universal/app link handler
|   |-- fcm_manager.dart          Firebase Cloud Messaging
|   |-- hive_manager.dart         NoSQL local storage
|   |-- shared_pref_manager.dart  Key-value persistence wrapper
|
|-- models/                      Data models (plain Dart, no ORM)
|   |-- api_documents_paginated_list_model.dart
|   |-- data_paginated_list_model.dart
|   |-- paginated_request_model.dart
|   |-- audience/
|   |-- chat/
|   |-- collection/
|   |-- common/
|   |-- creator/
|   |-- membership/
|   |-- message/
|   |-- notification/
|   |-- payout/
|   |-- post/
|   |-- promotions/
|   |-- social_link/
|   |-- subscription/
|   |-- user/
|
|-- navigation/                 Routing
|   |-- app_router.dart           GoRouter configuration
|   |-- direct_navigator.dart      Programmatic navigation helper
|
|-- pages/                      UI layer
|   |-- my_app.dart               Root widget (MultiProvider + MaterialApp)
|   |-- tab_state.dart            Bottom nav tab index state
|   |-- authentication/
|   |-- creator/                  Creator-mode screens
|   |-- explore/
|   |-- home/
|   |-- memberships/
|   |-- messaging/
|   |-- notification/
|   |-- post/
|   |-- profile/
|   |-- static/
|   |-- components/               Reusable widgets
|       |-- common/
|       |-- widgets/
|
|-- styles/                     Theming
|   |-- font_manager.dart         Custom font registration
|   |-- styles.dart               Color palette and sizing
|   |-- theme_data.dart           Light/dark ThemeData builder
|   |-- theme_provider.dart       Theme state + toggle
|
|-- utils/                       General utilities
|   |-- datetime.dart
|   |-- extensions.dart           Color, String, DateTime, BuildContext extensions
|   |-- my_print.dart             Debug-only logging
|   |-- my_safe_state.dart        StatefulWidget base mixin
|   |-- my_toast.dart
|   |-- my_utils.dart             Clipboard, UUID, JSON, formatting
|   |-- random_username_generator.dart
|
|-- backend/                     Business logic + data layer
|   |-- app_init_controller.dart  App startup orchestration
|   |-- dependency_injection.dart  DI container (singleton instances)
|   |-- audience/
|   |-- authentication/
|   |-- collections/
|   |-- common/
|       |-- api_service.dart      Central HTTP client
|       |-- api_endpoints.dart    All 60+ endpoint constants
|       |-- api_response.dart     Response wrapper
|       |-- api_exception.dart    Exception class
|       |-- common_provider.dart  Base state classes
|       |-- app_controller.dart
|   |-- creator/
|   |-- creator_section/
|   |-- insights_earnings_analytics/
|   |-- insights_memberships_analytics/
|   |-- insights_posts_analytics/
|   |-- library/
|   |-- memberships/
|   |-- messaging/
|   |-- notification/
|   |-- payout/
|   |-- post/
|   |-- post_creation/
|   |-- post_report/
|   |-- promotions/
|   |-- user/
|   |-- user_deletion/
|   |-- user_report/
```

**Conventions:**
- `*Provider` classes hold reactive state (extend `ChangeNotifier`).
- `*Controller` classes orchestrate repositories and provider updates.
- `*Repository` classes wrap `ApiService` and parse responses.
- `*Provider`, `*Controller`, `*Repository` live together in `backend/<feature>/`.
- Models live in `models/<feature>/`.
- Screens live in `pages/<feature>/`.
- Reusable UI widgets live in `pages/components/<category>/`.

---

## 3. Navigation & Routing

### GoRouter (`lib/navigation/app_router.dart`)

The app uses **GoRouter** for declarative, URL-based routing with 36 named routes:

```dart
Routes.splash
Routes.login
Routes.signUp
Routes.main              // User mode (5-tab nav)
Routes.editProfile
Routes.postDetails
Routes.creatorListing
Routes.membershipListing
Routes.becomeCreatorOnboarding
Routes.myCreatorPage
Routes.creatorMain       // Creator mode (sidebar nav)
Routes.createPostMain
Routes.explore
Routes.memberSettings
Routes.collectionPosts
Routes.audience
Routes.creatorProfile
Routes.chat
Routes.groupChatDetails
Routes.tos
Routes.privacyPolicy
Routes.messaging
Routes.joinMembership
Routes.legal
Routes.createTextPost
Routes.createVideoPost
Routes.createAudioPost
Routes.createImagePost
Routes.createLinkPost
Routes.addEditDiscount
Routes.addEditGift
Routes.publishCreator
Routes.addEditAbout
Routes.videoTrimmer
```

Navigation methods:
- `context.goNamed(RouteName)` — replace current route
- `context.pushNamed(RouteName, extra: {...})` — push on top
- `AppRouter.rootNavigatorKey.currentContext` — programmatic navigation from non-widget code

### DirectNavigator (`lib/navigation/direct_navigator.dart`)

A helper for **programmatic navigation** from controllers, managers, or any non-widget code. Provides methods like `navigateToPostDetails()`, `navigateToChat()`, `navigateToCreatorProfile()`, etc.

### Dual-Mode Navigation

The app has two distinct modes:

| Mode | Route | Navigation |
|---|---|---|
| **User** | `/main` | 5-tab bottom nav (Home, Explore, Chats, Alerts, Profile) |
| **Creator** | `/creatorMain` | Sidebar nav (Home, Library, Audience, Insights, Payouts, Promotions, Messages, Notifications, Settings) |

Mode is persisted in SharedPreferences (`SharedPreferenceConstants.isCreatorMode`).

---

## 4. State Management

### Provider + Custom Base Classes

The app uses **Provider** (`ChangeNotifier`) with a hand-rolled reactive system built on a base class hierarchy.

### CommonProvider Base (`lib/backend/common/common_provider.dart`)

```
CommonProvider (ChangeNotifier)
  └── notify({isNotify}) method

CommonProviderPrimitiveParameter<T>    Single-value reactive state
CommonProviderListParameter<T>         List state with CRUD helpers
CommonProviderMapParameter<K, V>       Map state
```

These wrap primitives in observable state with typed `get()` / `set()` methods and an optional `isNotify` flag for batching updates.

### Paginated State (`lib/models/common/`)

```
DataDocumentsPaginatedListModel<T>
  ├── contentsList (List<T>)
  ├── pageIndex, limit, refreshLimit
  ├── hasMore, isFirstTimeLoading, isLoading
  └── reset()

APIDocumentsPaginatedListModel<T>
  ├── currentPage, totalPages
  └── reset() resets to initialPageIndex
```

### Provider Registration (`lib/pages/my_app.dart`)

17 `ChangeNotifierProvider` instances are registered in `MultiProvider`:

```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider<AuthenticationProvider>,
    ChangeNotifierProvider<AppThemeProvider>,
    ChangeNotifierProvider<PostProvider>,
    ChangeNotifierProvider<MyCreatorProvider>,
    ChangeNotifierProvider<DirectMessageProvider>,
    ChangeNotifierProvider<LikedPostsProvider>,
    ChangeNotifierProvider<MyNotificationProvider>,
    ChangeNotifierProvider<PostCreationProvider>,
    ChangeNotifierProvider<CollectionProvider>,
    ChangeNotifierProvider<MembershipProvider>,
    ChangeNotifierProvider<DiscountProvider>,
    ChangeNotifierProvider<GiftProvider>,
    ChangeNotifierProvider<MembershipAnalyticsProvider>,
    ChangeNotifierProvider<EarningsAnalyticsProvider>,
    ChangeNotifierProvider<PostsAnalyticsProvider>,
    ChangeNotifierProvider<PayoutProvider>,
    ChangeNotifierProvider<AudienceProvider>,
    ChangeNotifierProvider<TabState>,
  ],
  child: const MyApp(),
)
```

### Dependency Injection (`lib/backend/common/dependency_injection.dart`)

All providers, controllers, and services are **singleton instances** stored in a static `DependencyInjection` class:

```dart
class DependencyInjection {
  static final AuthenticationProvider authenticationProvider = AuthenticationProvider();
  static final AuthenticationController authenticationController = AuthenticationController(...);
  static final PostProvider postProvider = PostProvider();
  static final ChatSocketService chatSocketService = ChatSocketService();
  // ... 17+ singletons total
}
```

---

## 5. API & Service Layer

### ApiService (`lib/backend/common/api_service.dart`)

A **singleton** HTTP client (wraps `package:http`). Key methods:

| Method | Description |
|---|---|
| `get(endpoint, queryParams, includeAuth)` | GET request |
| `post(endpoint, body, includeAuth)` | POST JSON request |
| `put(endpoint, body, includeAuth)` | PUT request |
| `delete(endpoint, body, includeAuth)` | DELETE request |
| `getOrThrow(...)` / `postOrThrow(...)` | Throws on non-2xx response |
| `multipartRequest(...)` | File upload with form fields |
| `multipartRequestWithStream(...)` | Streaming large file upload |
| `rawRequest(...)` | Raw HTTP for external services (e.g., S3) |

**Key behaviors:**
- Automatic Bearer token injection from SharedPreferences
- Request/response logging (debug mode only)
- Status code classification (success 200–299)
- `SocketException` → `isNetworkError`
- Pagination helper with ID deduplication

### ApiResponse (`lib/backend/common/api_response.dart`)

```dart
class ApiResponse<T> {
  bool success;
  T? data;
  int statusCode;
  String? message;
  String? errorMessage;

  factory ApiResponse.success({...})
  factory ApiResponse.error({...})
  bool get hasData
  T dataOrThrow   // throws if null
  T dataOr(T fallback)
}
```

### ApiException (`lib/backend/common/api_exception.dart`)

```dart
class ApiException implements Exception {
  int statusCode;
  String message;
  dynamic data;
  String? endpoint;

  bool get isAuthError    // 401/403
  bool get isNotFound     // 404
  bool get isServerError  // 5xx
  bool get isNetworkError // statusCode == 0
}
```

### ApiEndpoints (`lib/backend/common/api_endpoints.dart`)

Single file with 60+ endpoint constants organized by domain. Base URL: `https://your-backend-server.example.com.com`.

| Prefix | Domain | Count |
|---|---|---|
| `auth*` | Authentication | 4 |
| `users*` | User profile management | 14 |
| `notifications*` | Push notification settings | 3 |
| `posts*` | Posts CRUD + likes/comments | 30+ |
| `creator*` | Creator lookup | 3 |
| `memberships*` | Membership tiers | 9 |
| `collections*` | Post collections | 5 |
| `chat*` | Messaging | 5 |
| `payments*` | Payouts | 3 |
| `promotions*` | Discounts/gifts | 5 |
| `analytics*` | Insights | 3 |
| `s3*` | File uploads | 2 |
| `home*` | Feed discovery | 2 |
| `reports*` | User/post reporting | 2 |

### Repository Pattern

Each feature domain has a repository class wrapping `ApiService`:

```
AuthenticationRepository  — auth flows
PostRepository           — post operations
UserRepository           — user profile CRUD
ChatRepository           — messaging
MembershipRepository
CollectionRepository
NotificationRepository
PayoutRepository
...
```

Pattern: `Repository` → calls `ApiService` → parses response → returns typed result.

### Controller Pattern

Each feature has a controller that orchestrates between repository and provider:

```
AuthenticationController  — login, logout, token validation, Google sign-in
PostController            — feed fetching
DirectMessageController   — chat messaging
AudienceController
CollectionController
MembershipController
...
```

Controllers call repositories and update provider state. They do **not** hold state directly.

---

## 6. Authentication

### Startup Flow

```
main.dart
  → AppInitController.performInitialAppOpeningOperations()
    → Check SharedPreferences for auth_token + user_id
    → AuthenticationController.isUserLoggedIn()
      → AuthenticationRepository.getUserFromToken(token)
      → Returns UserModel or null
    → If not logged in → Routes.login
    → If logged in → Routes.main or Routes.creatorMain
```

### Supported Methods

**Google Sign-In:**
1. `AuthenticationRepository.getGoogleAccount()` — Google OAuth popup
2. Receive `idToken`, call `AuthenticationRepository.loginWithGoogleBackend(accessToken)`
3. Backend returns `{ token, user }`
4. `AuthenticationController.onLoginSuccess()` stores token + userId
5. Navigate to main/creatorMain

**Email/Password:**
1. `AuthenticationRepository.signInWithEmail(email, password)`
2. Backend returns `{ token, userData }`
3. Store token → navigate

### Token Storage (SharedPreferences)

| Key | Constant | Value |
|---|---|---|
| `"authToken"` | `SharedPreferenceConstants.authToken` | JWT bearer token |
| `"user_id"` | `SharedPreferenceConstants.userId` | User UUID |
| `"loginSessionId"` | `SharedPreferenceConstants.loginSessionId` | Session ID |
| `"is_creator_mode"` | `SharedPreferenceConstants.isCreatorMode` | `true`/`false` |

### Logout

`AuthenticationController.logout()` performs:
1. Call `AuthenticationRepository.signOut()` (Google sign-out)
2. Clear all SharedPreferences
3. Reset all provider data
4. Dispose `NotificationManager` and `DeepLinkManager`
5. Clear all Hive data
6. Navigate to `Routes.login`

---

## 7. Data Models

All models are **plain Dart classes** (no ORM) in `lib/models/`. Each follows this structure:

```dart
class PostModel {
  String id;
  String content;
  String? imageUrl;
  int likesCount;
  DateTime createdAt;

  factory PostModel.fromMap(Map<String, dynamic> map) { ... }
  void updateFromMap(Map<String, dynamic> map) { ... }
  Map<String, dynamic> toMap({bool toJson = false}) { ... }
  @override String toString() => jsonEncode(toMap());
}
```

**Key models:**
| Model | File | Purpose |
|---|---|---|
| `UserModel` | `models/user/` | User profile data |
| `CreatorModel` | `models/creator/` | Creator-specific data |
| `PostModel` | `models/post/` | Post content + metadata |
| `MembershipModel` | `models/membership/` | Membership tier |
| `CollectionModel` | `models/collection/` | Post collection |
| `ChatModel` | `models/chat/` | Chat thread |
| `MessageModel` | `models/message/` | Individual message |
| `NotificationModel` | `models/notification/` | Push notification |
| `PayoutModel` | `models/payout/` | Creator payout record |
| `DiscountModel` | `models/promotions/` | Discount offer |
| `GiftModel` | `models/promotions/` | Gift offer |
| `SocialLinkModel` | `models/social_link/` | Creator social links |
| `ChatItem` | `models/chat/` | View model (Chat + User + Message) |

---

## 8. Managers & Services

### SharedPrefManager (`lib/managers/shared_pref_manager.dart`)

Singleton wrapper for `SharedPreferences`. Provides typed CRUD for `String`, `int`, `double`, `bool`. Lazy initialization.

### HiveManager (`lib/managers/hive_manager.dart`)

Singleton for **NoSQL local storage**. Opens named Hive boxes, stores/retrieves typed objects. `clearAllData()` used during logout.

### NotificationManager (`lib/managers/fcm_manager.dart`)

FCM lifecycle management:

```dart
NotificationManager.instance.initialize()   // permissions, local notif init, FCM token, topic subscriptions
NotificationManager.instance.dispose()       // cancel subscriptions, delete token
```

Handles three message states: **foreground**, **background**, **terminated**. Parses notification data for navigation to posts, chats, profiles.

### ChatSocketService (`lib/managers/socket_service.dart`)

Socket.IO singleton for real-time chat:

```dart
ChatSocketService.connect(token)
ChatSocketService.disconnect()
ChatSocketService.joinChat(chatId)
ChatSocketService.leaveChat(chatId)
ChatSocketService.sendMessage(chatId, message)
ChatSocketService.onNewMessage(handler)  // subscribe
ChatSocketService.offNewMessage()         // unsubscribe
```

Reconnects automatically and re-attaches handlers on reconnect.

### DeepLinkManager (`lib/managers/deeplink_manager.dart`)

Singleton that subscribes to the `app_links` stream and parses URI paths:

```
post/{id}        → PostDetails
creator/{username} → CreatorProfile
profile/{username}/chat → Chat
```

Routes to `DirectNavigator` methods based on path segments.

---

## 9. Design Patterns

| Pattern | Location | Description |
|---|---|---|
| **Singleton** | `ApiService`, managers, `DependencyInjection` | One instance per class |
| **Repository** | `backend/*/ *Repository.dart` | Abstracts data source from business logic |
| **Controller** | `backend/*/ *Controller.dart` | Orchestrates repository + provider updates |
| **Provider / ChangeNotifier** | `backend/*/ *Provider.dart` | Reactive state management |
| **Dependency Injection** | `dependency_injection.dart` | Static singleton container |
| **Factory** | `UserModel.fromMap()`, `PostModel.fromMap()` | Create instances from JSON |
| **Builder** | `AppTheme.getLightTheme()`, `AppTheme.getDarkTheme()` | Complex ThemeData construction |
| **Wrapper** | `ApiResponse<T>`, `ApiException` | Standardize API outcomes |
| **Extension Methods** | `lib/utils/extensions.dart` | Add methods to Color, String, DateTime, BuildContext |
| **Paginated List** | `APIDocumentsPaginatedListModel<T>` | Cursor/page-based list state |
| **Socket.IO** | `ChatSocketService` | Real-time bidirectional chat |
| **Observer** | `WidgetsBindingObserver` on screens | App lifecycle events |

---

## 10. Core Workflows & Data Flow

### Read Flow: Post Feed

```
Widget (StatefulWidget)
  → context.watch<PostProvider>()
  → PostController.getPosts()
  → PostRepository.getPosts()
  → ApiService.get('/posts?page=1&limit=10')
  → Backend: https://your-backend-server.example.com.com
  → PostModel.fromMap(json)
  → PostProvider.myCreatorPagePostsListPaginationModel.contentsList.setList()
  → notifyListeners()
  → Widget rebuilds
```

### Write Flow: Create Post

```
Form Widget
  → PostCreationProvider (staging form data)
  → PostCreationController.createPost()
  → PostCreationRepository (multipart or JSON API)
  → ApiService.multipartRequest() or post()
  → On success: update PostProvider → notifyListeners()
  → Navigate back
```

### Real-time Chat Flow

```
ChatSocketService.connect(token)
  → joinChat(chatId) [socket emit]
  → onNewMessage(handler) [socket.on]
  → DirectMessageProvider.messages.setList() [append]
  → notifyListeners()
  → Chat UI rebuilds
```

### Push Notification Flow

```
Firebase Cloud Messaging
  → FirebaseMessaging.onMessage / onMessageOpenedApp
  → NotificationManager._handleNotificationTap(data)
  → DeepLinkManager / DirectNavigator
  → Programmatic routing to post/chat/profile
```

### Deep Link Flow

```
AppLinks (app_links package) uriLinkStream
  → DeepLinkManager._navigateTo(uri)
  → DirectNavigator.navigateTo*(...)
  → Route to appropriate screen
```

### App Startup Flow

```
main.dart
  → Firebase.initializeApp()
  → AppInitController.performInitialAppOpeningOperations()
    → Initialize Hive
    → Load theme preference
    → Check auth token
    → Validate token via API
    → Determine route (login / main / creatorMain)
  → runApp(MultiProvider(child: MyApp()))
  → MyApp → MaterialApp.router
  → GoRouter matches route → renders screen
```

---

## 11. Key Files Reference

| File | Purpose |
|---|---|
| `lib/main.dart` | Entry point: Firebase init, app init, `runApp()` |
| `lib/pages/my_app.dart` | Root widget: `MultiProvider` + `MaterialApp.router` |
| `lib/navigation/app_router.dart` | All 36 named routes via GoRouter |
| `lib/backend/common/dependency_injection.dart` | All 17 singleton provider/controller instances |
| `lib/backend/common/api_service.dart` | Central HTTP client |
| `lib/backend/common/api_endpoints.dart` | 60+ API endpoint URL constants |
| `lib/backend/app_init_controller.dart` | App startup orchestration |
| `lib/pages/tab_state.dart` | Bottom nav tab index |
| `lib/styles/theme_data.dart` | Complete `ThemeData` for light/dark |
| `lib/constants/shared_preference_constants.dart` | All SharedPreferences key names |

---

## 12. Constants, Helpers & Utilities

### Constants (`lib/constants/`)

| File | Contents |
|---|---|
| `api_constants.dart` | `ApiUrls.prodBaseUrl`, `AppTypes`, discount/gift types, asset paths |
| `app_constants.dart` | `AppAssets` — onboarding images, logo, icons, lottie paths |
| `auth_constants.dart` | `AuthenticationModes` — google, apple, phoneNumber, email |
| `chat_constants.dart` | Chat-related constants |
| `data_constants.dart` | General data constants |
| `notification_constants.dart` | Notification type constants |
| `post_constants.dart` | Post type constants |
| `shared_preference_constants.dart` | 14 SharedPreferences key names |
| `ui_constants.dart` | UI dimension/spacing constants |
| `user_constants.dart` | User-related constants |
| `constants.dart` | Barrel re-export |

### Helpers (`lib/helpers/`)

**ParsingHelper** — Safe dynamic type conversion with defaults:
- `parseStringMethod`, `parseIntMethod`, `parseDoubleMethod`, `parseBoolMethod`
- `parseDateTimeMethod` — handles `DateTime`, int millis, ISO8601 string
- `parseListMethod<T1, T2>`, `parseMapMethod<K1, V1, K2, V2>`
- `parseValue<T>` — switch-based type dispatch

**ImageHelper** — Three-stage image pipeline:
1. `pickAndProcessImage()` — pick (gallery/camera) → crop → compress → return `File`
2. `pickAndProcessMultipleImages()` — multi-select with compression
3. `cropImage()` — re-crop existing file
4. `_compressImage()` — adaptive quality (50–80%) based on file size

**EncryptionHelper** — AES encryption utilities.

### Utilities (`lib/utils/`)

| File | Contents |
|---|---|
| `my_print.dart` | `MyPrint.printOnConsole()` — debug-only logging |
| `my_utils.dart` | `getNewId()` (UUID), `copyToClipboard()`, `encodeJson/decodeJson()`, `formatDigitsForAmount()`, `commonShowModelBottomSheet()` |
| `extensions.dart` | `DateTime.getDateString()`, `String.checkNotEmpty`, `Color.getColor()`, `HexColor.fromHex()`, `BuildContext.sizeData` |
| `my_safe_state.dart` | `MySafeState` mixin — `themeData`, `mySetState()`, `mounted` safety |
| `my_toast.dart` | Toast notification display |
| `datetime.dart` | Date/time utilities |
| `random_username_generator.dart` | Random username generation |

---

## 13. Theming

### Color Palette (`lib/styles/styles.dart`)

- **Scaffold background**: warm off-white `#F7F5ED`
- **Primary (light)**: `#1E6FBF`
- **Primary (dark)**: `#2B85D9`
- Blue color scale: blue50 through blue900

### AppTheme (`lib/styles/theme_data.dart`)

```dart
AppTheme.getLightTheme()  // Full ThemeData for light mode
AppTheme.getDarkTheme()   // Full ThemeData for dark mode
```

### ThemeProvider (`lib/styles/theme_provider.dart`)

`ChangeNotifier` with methods `setDarkThemeMode()` and `toggleThemeMode()`. Theme preference is persisted via SharedPreferences.

### Fonts

Two font families:
1. **TestTiemposHeadline** — custom OTF with 22 variants (Regular/Light/Medium/Semibold/Bold/Black, each with Italic, weights 300–900)
2. **Epilogue** — Google Fonts (standard weights)

Registered in `lib/styles/font_manager.dart` and applied via `ThemeData` text themes.

---

## Architecture at a Glance

```
Flutter App (Dart)
 │
 ├─ Entry: main.dart
 │   └─ MyApp (MultiProvider + MaterialApp.router)
 │       ├─ AppRouter (GoRouter, 36 named routes)
 │       └─ MainApp (MaterialApp.router + OverlaySupport)
 │
 ├─ State Layer: 17 ChangeNotifier Providers (singleton via DependencyInjection)
 │   ├─ CommonProvider base: PrimitiveParameter<T>, ListParameter<T>, MapParameter<K,V>
 │   └─ APIDocumentsPaginatedListModel<T> for paginated lists
 │
 ├─ Business Layer: Controller classes
 │   ├─ Repository classes (ApiService wrappers)
 │   ├─ ApiService (singleton HTTP client)
 │   └─ Base URL: https://your-backend-server.example.com.com + 60+ endpoints
 │
 ├─ UI Layer: pages/ (screens) + pages/components/ (reusable widgets)
 │   ├─ User Mode: 5-tab bottom nav
 │   └─ Creator Mode: Sidebar nav
 │
 ├─ Managers: SharedPrefManager, HiveManager, ChatSocketService,
 │   NotificationManager, DeepLinkManager
 │
 ├─ Push: Firebase Messaging + flutter_local_notifications
 ├─ Real-time: Socket.IO (chat)
 └─ Deep Links: app_links package + DeepLinkManager
```
