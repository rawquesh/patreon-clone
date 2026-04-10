import 'package:flutter/material.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/user/my_user_controller.dart';

class MemberSettingsScreen extends StatefulWidget {
  static const String routeName = '/MemberSettingsScreen';

  const MemberSettingsScreen({super.key});

  @override
  State<MemberSettingsScreen> createState() => _MemberSettingsScreenState();
}

class _MemberSettingsScreenState extends State<MemberSettingsScreen> with MySafeState {
  String? selectedContentVisibility;
  String? selectedCreatorCategory;
  late MyUserController _userController;
  late AuthenticationProvider _authProvider;

  final Map<String, String> _visibilityMap = const {
    "Everyone - Visible to all users": "both",
    "Male Only - Only visible to male users": "male",
    "Female Only - Only visible to female users": "female",
  };

  // Toggle states
  bool _notifyOnNewPosts = false;
  bool _notifyOnDMs = false;

  void _showChangePasswordDialog() {
    final TextEditingController oldPasswordController = TextEditingController();
    final TextEditingController newPasswordController = TextEditingController();
    final TextEditingController confirmPasswordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(
            'Change Password',
            style: themeData.textTheme.titleLarge
                ?.copyWith(
                  color: themeData.colorScheme.primary,
                  fontWeight: FontWeight.bold,
                )
                .withEpilogue,
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: oldPasswordController,
                  decoration: InputDecoration(
                    labelText: 'Current Password',
                    labelStyle: themeData.textTheme.labelMedium
                        ?.copyWith(
                          color: themeData.colorScheme.onSurface.withValues(
                            alpha: 0.6,
                          ),
                        )
                        .withEpilogue,
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newPasswordController,
                  decoration: InputDecoration(
                    labelText: 'New Password',
                    labelStyle: themeData.textTheme.labelMedium
                        ?.copyWith(
                          color: themeData.colorScheme.onSurface.withValues(
                            alpha: 0.6,
                          ),
                        )
                        .withEpilogue,
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmPasswordController,
                  decoration: InputDecoration(
                    labelText: 'Confirm New Password',
                    labelStyle: themeData.textTheme.labelMedium
                        ?.copyWith(
                          color: themeData.colorScheme.onSurface.withValues(
                            alpha: 0.6,
                          ),
                        )
                        .withEpilogue,
                  ),
                  obscureText: true,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Cancel',
                style: themeData.textTheme.labelMedium
                    ?.copyWith(
                      color: themeData.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    )
                    .withEpilogue,
              ),
            ),
            TextButton(
                onPressed: () async {
                  final current = oldPasswordController.text.trim();
                  final newPass = newPasswordController.text.trim();
                  final confirm = confirmPasswordController.text.trim();

                  if (current.isEmpty || newPass.isEmpty || confirm.isEmpty) {
                    MyToast.showError(context: context, msg: 'Please fill all fields');
                    return;
                  }
                  if (newPass != confirm) {
                    MyToast.showError(context: context, msg: 'New password and confirmation do not match');
                    return;
                  }
                  if (current == newPass) {
                    MyToast.showError(context: context, msg: 'New password must be different from current password');
                    return;
                  }

                  final result = await _userController.resetPassword(
                    currentPassword: current,
                    newPassword: newPass,
                    confirmPassword: confirm,
                  );

                  Navigator.of(context).pop();

                  if (result.isSuccess) {
                    MyToast.showSuccess(context: context, msg: result.data?['message'] ?? 'Password changed successfully');
                  } else {
                    final status = result.statusCode;
                    final msg = result.errorMessage?.toLowerCase() ?? '';

                    if (status == 401 && msg.contains("incorrect")) {
                      MyToast.showError(context: context, msg: "Current password is incorrect");
                    } else if (status == 400 && msg.contains("confirmation")) {
                      MyToast.showError(context: context, msg: "New password and confirmation do not match");
                    } else {
                      MyToast.showError(context: context, msg: result.errorMessage ?? "Failed to change password");
                    }
                  }
                },
                child: Text(
                  'Submit',
                  style: themeData.textTheme.labelMedium
                      ?.copyWith(
                        color: themeData.colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      )
                      .withEpilogue,
                )),
          ],
        );
      },
    );
  }

  Future<void> _updateNotificationSettings() async {
    final result = await _userController.updateNotificationSettings(
      notifyOnNewPost: _notifyOnNewPosts,
      notifyOnDirectMessages: _notifyOnDMs,
    );

    if (mounted) {
      if (result.isSuccess) {
        MyToast.showSuccess(context: context, msg: 'Notification settings updated');
      } else {
        MyToast.showError(context: context, msg: result.errorMessage ?? 'Failed to update notification settings');
        final user = _authProvider.userModel.get();
        if (user != null) {
          _notifyOnNewPosts = user.memberNotifyOnNewPost;
          _notifyOnDMs = user.memberNotifyOnDirectMessages;
          mySetState();
        }
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _authProvider = context.read<AuthenticationProvider>();
    _userController = MyUserController();

    final user = _authProvider.userModel.get();
    if (user != null) {
      selectedCreatorCategory = user.creatorCategory.isNotEmpty ? user.creatorCategory : null;
      selectedContentVisibility = _visibilityMap.entries
          .firstWhere((e) => e.value == user.contentVisibleTo, orElse: () => _visibilityMap.entries.first)
          .key;
      _notifyOnNewPosts = user.memberNotifyOnNewPost;
      _notifyOnDMs = user.memberNotifyOnDirectMessages;
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      appBar: AppBar(
        backgroundColor: themeData.primaryColor,
        elevation: 0,
        title: Text(
          'Settings',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: themeData.colorScheme.onPrimary,
            letterSpacing: -0.5,
          ).withTiempos,
        ),
        leading: IconButton(
          icon: Icon(
            Icons.chevron_left,
            color: themeData.colorScheme.onPrimary,
            size: 32,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Security Section
            _buildSection(
              title: 'Security',
              children: [
                _buildActionItem(
                  title: 'Change Password',
                  subtitle: 'Update your account password',
                  icon: Icons.lock_outline,
                  onTap: _showChangePasswordDialog,
                  showArrow: true,
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Notifications Section
            _buildSection(
              title: 'Notifications',
              children: [
                _buildToggleItem(
                  title: 'New Posts',
                  subtitle: 'Get notified when new posts are published',
                  icon: Icons.notifications_outlined,
                  value: _notifyOnNewPosts,
                  onChanged: (value) {
                    setState(() => _notifyOnNewPosts = value);
                    _updateNotificationSettings();
                  },
                ),
                _buildDivider(),
                _buildToggleItem(
                  title: 'Direct Messages',
                  subtitle: 'Get notified when you receive direct messages',
                  icon: Icons.message_outlined,
                  value: _notifyOnDMs,
                  onChanged: (value) {
                    setState(() => _notifyOnDMs = value);
                    _updateNotificationSettings();
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade700,
              letterSpacing: 0.2,
            ).withEpilogue,
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildActionItem({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
    bool showArrow = false,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: themeData.primaryColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: themeData.primaryColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ).withEpilogue,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                        color: Colors.grey.shade600,
                      ).withEpilogue,
                    ),
                  ],
                ),
              ),
              if (showArrow)
                Icon(
                  Icons.chevron_right,
                  color: Colors.grey.shade400,
                  size: 20,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildToggleItem({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onChanged(!value),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: value ? themeData.primaryColor.withValues(alpha: 0.1) : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: value ? themeData.primaryColor : Colors.grey.shade500,
                  size: 20,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ).withEpilogue,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                        color: Colors.grey.shade600,
                      ).withEpilogue,
                    ),
                  ],
                ),
              ),
              Transform.scale(
                scale: 0.9,
                child: Switch(
                  value: value,
                  onChanged: onChanged,
                  activeColor: Colors.white,
                  activeTrackColor: themeData.primaryColor,
                  inactiveThumbColor: Colors.white,
                  inactiveTrackColor: Colors.grey.shade300,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      height: 0.5,
      color: Colors.grey.shade200,
    );
  }
}
