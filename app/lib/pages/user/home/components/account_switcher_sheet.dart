import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/navigation/direct_navigator.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';
import 'package:patreon-clone/styles/font_manager.dart';

class AccountSwitcherSheet extends StatefulWidget {
  const AccountSwitcherSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      isScrollControlled: true,
      builder: (_) => const AccountSwitcherSheet(),
    );
  }

  @override
  State<AccountSwitcherSheet> createState() => _AccountSwitcherSheetState();
}

class _AccountSwitcherSheetState extends State<AccountSwitcherSheet> with MySafeState {
  bool _isCreatorMode = false;

  @override
  void initState() {
    super.initState();
    _loadMode();
  }

  Future<void> _loadMode() async {
    _isCreatorMode = await SharedPrefManager().getBool(SharedPreferenceConstants.isCreatorMode) ?? false;
    mySetState();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    UserModel userModel = DependencyInjection.authenticationProvider.userModel.get() ?? UserModel();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          // Handle bar
          Container(
            height: 4,
            width: 40,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Text(
                "Switch Account",
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Colors.black87,
                ).withEpilogue,
              ),
              const Spacer(),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close, size: 20),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 20),
          InkWell(
            onTap: () => _onUserAction(context),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: themeData.primaryColor, width: 2),
                    ),
                    child: ClipOval(
                      child: userModel.profilePicture.isNotEmpty
                          ? Image.network(
                              userModel.profilePicture,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => _buildDefaultAvatar(userModel),
                            )
                          : _buildDefaultAvatar(userModel),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          userModel.displayName.isNotEmpty
                              ? userModel.displayName
                              : "${userModel.firstName} ${userModel.lastName}".trim(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                            color: Colors.black87,
                          ).withEpilogue,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: themeData.primaryColor,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            "Member",
                            style: const TextStyle(
                              fontSize: 10,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ).withEpilogue,
                          ),
                        ),
                      ],
                    ),
                  ),
                  !_isCreatorMode
                      ? Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: themeData.primaryColor,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 16,
                          ),
                        )
                      : Icon(
                          Icons.arrow_forward_ios,
                          color: Colors.purple[400],
                          size: 16,
                        ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Divider(color: Colors.grey[200], height: 1),
          const SizedBox(height: 16),
          if (userModel.isCreator) ...[
            InkWell(
              onTap: () {
                Navigator.pop(context);
                _onCreatorAction(context, userModel);
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Row(
                  children: [
                    // Same Profile Picture
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.purple, width: 2),
                      ),
                      child: ClipOval(
                        child: userModel.profilePicture.isNotEmpty
                            ? Image.network(
                                userModel.profilePicture,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => _buildDefaultAvatar(userModel),
                              )
                            : _buildDefaultAvatar(userModel),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            userModel.creatorUsername.isNotEmpty ? userModel.creatorUsername : "Creator Profile",
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                              color: Colors.black87,
                            ).withEpilogue,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: themeData.primaryColor,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              "Creator",
                              style: const TextStyle(
                                fontSize: 10,
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ).withEpilogue,
                            ),
                          ),
                        ],
                      ),
                    ),
                    _isCreatorMode
                        ? Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: themeData.primaryColor,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.check,
                              color: Colors.white,
                              size: 16,
                            ),
                          )
                        : Icon(
                            Icons.arrow_forward_ios,
                            color: Colors.purple[400],
                            size: 16,
                          ),
                  ],
                ),
              ),
            ),
          ] else ...[
            InkWell(
              onTap: () {
                Navigator.pop(context);
                _onCreatorAction(context, userModel);
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.grey[100],
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Icon(
                        CupertinoIcons.wand_stars,
                        color: Colors.grey[600],
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Become a Creator",
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                              color: Colors.black87,
                            ).withEpilogue,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            "Start your creator journey today!",
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ).withEpilogue,
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.arrow_forward_ios,
                      color: Colors.grey[400],
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 20),
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  // static void _onAddAccountTap(BuildContext context) async {
  //   context.pop(); // Close sheet
  //   context.pushNamed(Routes.login);
  // }

  void _onUserAction(BuildContext context) {
    Navigator.pop(context);
    if (_isCreatorMode) {
      DirectNavigator.navigateToMainScreen(context, forceRefresh: true);
    }
  }

  Widget _buildDefaultAvatar(UserModel userModel) {
    String initials = "";
    if (userModel.firstName.isNotEmpty) {
      initials += userModel.firstName[0].toUpperCase();
    }
    if (userModel.lastName.isNotEmpty) {
      initials += userModel.lastName[0].toUpperCase();
    }
    if (initials.isEmpty && userModel.email.isNotEmpty) {
      initials = userModel.email[0].toUpperCase();
    }

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [themeData.primaryColor.withValues(alpha: 0.4), themeData.primaryColor.withValues(alpha: 0.6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text(
          initials,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ).withEpilogue,
        ),
      ),
    );
  }

  void _onCreatorAction(BuildContext context, UserModel userModel) {
    if (userModel.isCreator == true) {
      DirectNavigator.navigateToCreatorMainScreen(context);
    } else {
      context.pushNamed(Routes.becomeCreatorOnboarding);
    }
  }
}
