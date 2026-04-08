import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/services.dart';
import 'package:patreon-clone/navigation/app_router.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/backend/authentication/authentication_controller.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/user/home/components/account_switcher_sheet.dart';

import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';
import 'package:patreon-clone/pages/user/profile/delete_account_dialog.dart';
import 'package:patreon-clone/styles/theme_controller.dart';
import 'package:patreon-clone/styles/theme_provider.dart';
// import '../../navigation/navigation_controller.dart';
import 'package:patreon-clone/constants/constants.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> with MySafeState {
  late AuthenticationController authenticationController;
  late AuthenticationProvider authenticationProvider;
  late UserModel? userModel;

  Future<void> _handleLogout(BuildContext context) async {
    final bool confirmLogout = await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text(
              'Confirm Logout',
              style: themeData.textTheme.bodyLarge
                  ?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: themeData.colorScheme.onSurface,
                  )
                  .withEpilogue,
            ),
            content: Text(
              'Are you sure you want to logout?',
              style: themeData.textTheme.bodyMedium
                  ?.copyWith(
                    fontWeight: FontWeight.normal,
                    color: themeData.colorScheme.onSurface,
                  )
                  .withEpilogue,
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: Text(
                  'Cancel',
                  style: themeData.textTheme.bodyMedium
                      ?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: themeData.colorScheme.error,
                      )
                      .withEpilogue,
                ),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.red,
                ),
                child: Text(
                  'Logout',
                  style: themeData.textTheme.bodyMedium
                      ?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: themeData.colorScheme.primary,
                      )
                      .withEpilogue,
                ),
              ),
            ],
          ),
        ) ??
        false;

    // If user confirms, perform logout
    if (confirmLogout) {
      try {
        final bool success = await authenticationController.logout(
          isNavigateToLogin: true,
        );

        if (success && context.mounted) {
          // Navigate to login screen
          context.goNamed(Routes.login);

          MyToast.showSuccess(context: context, msg: "Successfully logged out");
        }
      } catch (e) {
        if (context.mounted) {
          MyToast.showError(context: context, msg: "Failed to LogOut $e");
        }
      }
    }
  }

  @override
  void initState() {
    super.initState();
    authenticationProvider = context.read<AuthenticationProvider>();
    authenticationController = DependencyInjection.authenticationController;
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Consumer<AuthenticationProvider>(
        builder: (BuildContext context, AuthenticationProvider authenticationProvider, Widget? child) {
      userModel = authenticationProvider.userModel.get();
      MyPrint.logOnConsole("userModel: $userModel");
      return Scaffold(
        appBar: AppBar(
          backgroundColor: themeData.primaryColor,
          centerTitle: false,
          title: Text(
            'Profile',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: themeData.colorScheme.onPrimary,
              letterSpacing: -0.5,
            ).withTiempos,
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.edit, color: Colors.white),
              onPressed: () {
                context.pushNamed(Routes.editProfile);
              },
            ),
          ],
        ),
        body: Column(
          children: [
            Expanded(
              child: ListView(
                children: [
                  Stack(
                    children: [
                      _buildBackgroundContainer(),
                      _buildUserInfo(),
                    ],
                  ),
                  const SizedBox(height: 30),
                  _buildOptionsList(),
                  const SizedBox(height: 20),
                  _buildLogoutButton(),
                  const SizedBox(height: 10),
                  _buildDeleteAccountButton(),
                ],
              ),
            ),
            const SizedBox(height: 10),
            _buildVersionNumber(),
            const SizedBox(height: 10),
          ],
        ),
      );
    });
  }

  Widget _buildBackgroundContainer() {
    return Container(
      height: 70,
      decoration: BoxDecoration(
        color: themeData.primaryColor,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(40),
          bottomRight: Radius.circular(40),
        ),
      ),
    );
  }

  Widget _buildUserInfo() {
    return Padding(
      padding: const EdgeInsets.only(top: 0),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(70)),
              child: userModel?.profilePicture != null && userModel!.profilePicture.isNotEmpty
                  ? Hero(
                      tag: "${userModel!.profilePicture}ProfilePicture",
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(66),
                        child: CommonCachedNetworkImage(
                          imageUrl: userModel!.profilePicture,
                          width: 100,
                          height: 100,
                        ),
                      ),
                    )
                  : Image.asset(
                      AppAssets.male,
                      width: 100,
                      height: 100,
                    ),
            ),
            const SizedBox(height: 5),
            Column(
              children: [
                Text(
                  userModel?.displayName ?? "",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: themeData.colorScheme.onSurface,
                  ).withEpilogue,
                ),
                Text(
                  "Member",
                  style: themeData.textTheme.labelSmall
                      ?.copyWith(
                        fontSize: 10,
                        fontWeight: FontWeight.normal,
                        color: themeData.colorScheme.onSurface,
                      )
                      .withEpilogue,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionsList() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 15),
      child: Column(
        children: [
          if (kDebugMode) _buildThemeSwitchItem(),
          _buildOptionItem(
            icon: AppAssets.newsIcon,
            title: "News (Coming Soon)",
          ),
          _divider(),
          GestureDetector(
            onTap: () {
              Future<void> launchExternalUrl(String url) async {
                if (await canLaunchUrl(Uri.parse(url))) {
                  await launchUrl(Uri.parse(url), mode: LaunchMode.inAppBrowserView);
                }
              }

              launchExternalUrl("https://forms.gle/c3NHFCMgJZDXaa6n8");
            },
            child: _buildOptionItem(
              icon: AppAssets.featureRequestIcon,
              title: "Feature Request",
            ),
          ),
          _divider(),
          GestureDetector(
            onTap: () {
              context.pushNamed(Routes.tos);
            },
            child: _buildOptionItem(
              icon: AppAssets.termsOfServiceIcon,
              title: "Terms Of Service",
            ),
          ),
          _divider(),
          GestureDetector(
            onTap: () {
              context.pushNamed(Routes.privacyPolicy);
            },
            child: _buildOptionItem(
              icon: AppAssets.privacyPolicyIcon,
              title: "Privacy Policy",
            ),
          ),
          _divider(),
          GestureDetector(
            onTap: () async {
              await HapticFeedback.selectionClick();
              AccountSwitcherSheet.show(context);
            },
            child: _buildOptionItem(
              icon: AppAssets.membershipIcon,
              title: "Creator Profile",
            ),
          ),
          _divider(),
          GestureDetector(
            onTap: () async {
              context.pushNamed(Routes.memberSettings);
            },
            child: _buildOptionItem(
              iconData: CupertinoIcons.settings_solid,
              title: "Settings",
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() => const SizedBox.shrink();

  Widget _buildThemeSwitchItem() {
    return Consumer<AppThemeProvider>(
      builder: (context, themeProvider, child) {
        final isDark = themeProvider.darkThemeMode;

        return Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            color: Colors.transparent, // Or theme background color
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor.withOpacity(0.7),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Sun
                  GestureDetector(
                    onTap: () async {
                      if (isDark) {
                        AppThemeController controller = AppThemeController(
                          appThemeProvider: themeProvider,
                        );
                        await controller.setDarkThemeEnabledInSharedPreferences(false);
                        controller.updateThemeMode(false);
                      }
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      curve: Curves.ease,
                      decoration: BoxDecoration(
                        color: !isDark ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          if (!isDark)
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.15),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                        ],
                      ),
                      padding: const EdgeInsets.all(8),
                      child: Icon(
                        Icons.wb_sunny_outlined,
                        size: 24,
                        color: !isDark ? Colors.black : Colors.black54,
                      ),
                    ),
                  ),
                  const SizedBox(width: 18),
                  // Moon
                  GestureDetector(
                    onTap: () async {
                      if (!isDark) {
                        AppThemeController controller = AppThemeController(
                          appThemeProvider: themeProvider,
                        );
                        await controller.setDarkThemeEnabledInSharedPreferences(true);
                        controller.updateThemeMode(true);
                      }
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      curve: Curves.ease,
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          if (isDark)
                            BoxShadow(
                              color: Colors.black.withOpacity(0.13),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                        ],
                      ),
                      padding: const EdgeInsets.all(8),
                      child: Icon(
                        Icons.nightlight_round,
                        size: 24,
                        color: isDark ? Colors.black : Colors.black54,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildOptionItem({
    String? icon,
    IconData? iconData,
    required String title,
  }) {
    return InkWell(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
        child: Row(
          children: [
            if (iconData != null)
              Icon(
                iconData,
                size: 22,
                color: themeData.colorScheme.onSurface,
              )
            else if (icon != null)
              Image.asset(
                icon,
                height: 22,
                width: 22,
              ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.normal).withEpilogue,
              ),
            ),
            const Icon(
              Icons.chevron_right,
              size: 16,
              color: Colors.grey,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Center(
      child: GestureDetector(
        onTap: () => _handleLogout(context),
        child: Container(
          decoration: BoxDecoration(
            color: themeData.primaryColor,
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.logout,
                color: Colors.white,
                size: 18,
              ),
              const SizedBox(width: 16),
              Text(
                "LOGOUT",
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.3,
                ).withEpilogue,
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDeleteAccountButton() {
    return Center(
      child: GestureDetector(
        onTap: () {
          showDialog(
            context: context,
            builder: (context) => const DeleteAccountDialog(),
          );
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.delete_forever,
                color: Colors.red,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                "Delete Account",
                style: const TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.3,
                  fontSize: 14,
                ).withEpilogue,
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVersionNumber() {
    return Text(
      'V 1.0.0',
      style: const TextStyle(color: Colors.grey, fontSize: 12).withEpilogue,
      textAlign: TextAlign.center,
    );
  }
}
