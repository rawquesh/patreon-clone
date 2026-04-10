import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/backend/authentication/authentication_controller.dart';
import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';
import 'package:patreon-clone/pages/user/profile/delete_account_dialog.dart';
import 'package:patreon-clone/backend/user/my_user_controller.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

// import '../../../navigation/navigation_controller.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> with MySafeState {
  String? selectedContentVisibility;
  String? selectedCreatorCategory;
  late MyUserController _userController;
  late AuthenticationProvider _authProvider;
  late AuthenticationController _authenticationController;

  final Map<String, String> _visibilityMap = const {
    "Everyone - Visible to all users": "both",
    "Male Only - Only visible to male users": "male",
    "Female Only - Only visible to female users": "female",
  };

  // Toggle states
  bool everyTimeUserJoined = false;
  bool commentsAndReplies = false;
  bool directMessages = false;
  bool newPaidMembers = false;

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
        final bool success = await _authenticationController.logout(isNavigateToLogin: true);

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

  Future<void> _updateCreatorNotificationSettings() async {
    final result = await _userController.updateCreatorNotificationSettings(
      creatorNotifyOnNewUserJoined: everyTimeUserJoined,
      creatorNotifyOnCommentsAndRepliesOnPosts: commentsAndReplies,
      creatorNotifyOnDirectMessages: directMessages,
    );

    if (mounted) {
      if (result.isSuccess) {
        MyToast.showSuccess(context: context, msg: 'Notification settings updated');
      } else {
        MyToast.showError(context: context, msg: result.errorMessage ?? 'Failed to update notification settings');
        final user = _authProvider.userModel.get();
        if (user != null) {
          everyTimeUserJoined = user.creatorNotifyOnNewUserJoined;
          commentsAndReplies = user.creatorNotifyOnCommentsAndRepliesOnPosts;
          directMessages = user.creatorNotifyOnDirectMessages;
          mySetState();
        }
      }
    }
  }

  Future<void> _updateContentVisibility(String? displayValue) async {
    if (displayValue == null) return;
    final previous = selectedContentVisibility;
    setState(() => selectedContentVisibility = displayValue);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Dialog(
        backgroundColor: Colors.transparent,
        elevation: 0,
        child: LoadingWidget(),
      ),
    );

    final result = await _userController.updateContentVisibility(
      visibility: _visibilityMap[displayValue] ?? 'both',
    );

    Navigator.of(context).pop();

    if (result.isSuccess) {
      MyToast.showSuccess(context: context, msg: 'Content visibility updated');
    } else {
      setState(() => selectedContentVisibility = previous);
      MyToast.showError(context: context, msg: result.errorMessage ?? 'Failed to update content visibility');
    }
  }

  Future<void> _updateCreatorCategory(String? category) async {
    if (category == null) return;
    final previous = selectedCreatorCategory;
    setState(() => selectedCreatorCategory = category);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Dialog(
        backgroundColor: Colors.transparent,
        elevation: 0,
        child: LoadingWidget(),
      ),
    );

    final result = await _userController.updateCreatorCategory(category: category);

    Navigator.of(context).pop();

    if (result.isSuccess) {
      MyToast.showSuccess(context: context, msg: 'Creator category updated');
    } else {
      setState(() => selectedCreatorCategory = previous);
      MyToast.showError(context: context, msg: result.errorMessage ?? 'Failed to update creator category');
    }
  }

  @override
  void initState() {
    super.initState();
    _authProvider = context.read<AuthenticationProvider>();
    _authenticationController = DependencyInjection.authenticationController;
    _userController = MyUserController();

    final user = _authProvider.userModel.get();
    if (user != null) {
      selectedCreatorCategory = user.creatorCategory.isNotEmpty ? user.creatorCategory : null;
      selectedContentVisibility = _visibilityMap.entries
          .firstWhere((e) => e.value == user.contentVisibleTo, orElse: () => _visibilityMap.entries.first)
          .key;
      everyTimeUserJoined = user.creatorNotifyOnNewUserJoined;
      commentsAndReplies = user.creatorNotifyOnCommentsAndRepliesOnPosts;
      directMessages = user.creatorNotifyOnDirectMessages;
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
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Account Section
            _buildSection(
              title: 'Account',
              children: [
                _buildDropdownItem(
                  title: 'Content Visibility',
                  subtitle: 'Control who can see your content',
                  icon: Icons.visibility_outlined,
                  child: _buildContentGenderPreferenceDropdown(),
                ),
                _buildDivider(),
                _buildDropdownItem(
                  title: 'Creator Category',
                  subtitle: 'Select your content category',
                  icon: Icons.category_outlined,
                  child: _buildCreatorCategoryDropdown(),
                ),
              ],
            ),

            const SizedBox(height: 16),

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
                  title: 'New User Joined',
                  subtitle: 'Get notified when someone joins your content',
                  icon: Icons.person_add_outlined,
                  value: everyTimeUserJoined,
                  onChanged: (value) {
                    setState(() => everyTimeUserJoined = value);
                    _updateCreatorNotificationSettings();
                  },
                ),
                _buildDivider(),
                _buildToggleItem(
                  title: 'Comments & Replies',
                  subtitle: 'Get notified about comments and replies on your posts',
                  icon: Icons.comment_outlined,
                  value: commentsAndReplies,
                  onChanged: (value) {
                    setState(() => commentsAndReplies = value);
                    _updateCreatorNotificationSettings();
                  },
                ),
                _buildDivider(),
                _buildToggleItem(
                  title: 'Direct Messages',
                  subtitle: 'Get notified when you receive direct messages',
                  icon: Icons.message_outlined,
                  value: directMessages,
                  onChanged: (value) {
                    setState(() => directMessages = value);
                    _updateCreatorNotificationSettings();
                  },
                ),
              ],
            ),

            // const SizedBox(height: 16),

            // Memberships Section
            // _buildSection(
            //   title: 'Memberships',
            //   children: [
            //     _buildToggleItem(
            //       title: 'New Paid Members',
            //       subtitle: 'Get notified about new paid subscriptions',
            //       icon: Icons.paid_outlined,
            //       value: newPaidMembers,
            //       onChanged: (value) => setState(() => newPaidMembers = value),
            //     ),
            //   ],
            // ),
            const SizedBox(height: 30),
            _buildLogoutButton(),
            const SizedBox(height: 16),
            _buildDeleteAccountButton(),
            const SizedBox(height: 30),
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
                color: Colors.black.withOpacity(0.04),
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
                  color: themeData.primaryColor.withOpacity(0.1),
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

  Widget _buildDropdownItem({
    required String title,
    required String subtitle,
    required IconData icon,
    required Widget child,
  }) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: themeData.primaryColor.withOpacity(0.1),
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
                const SizedBox(height: 12),
                child,
              ],
            ),
          ),
        ],
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
                  color: value ? themeData.primaryColor.withOpacity(0.1) : Colors.grey.shade100,
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

  Widget _buildContentGenderPreferenceDropdown() {
    List<String> preferences = [
      "Everyone - Visible to all users",
      "Male Only - Only visible to male users",
      "Female Only - Only visible to female users"
    ];

    return DropdownButtonFormField<String>(
      value: preferences.contains(selectedContentVisibility) ? selectedContentVisibility : null,
      decoration: InputDecoration(
        hintText: "Select content visibility",
        hintStyle: TextStyle(
          fontSize: 14,
          color: Colors.grey.shade500,
          fontWeight: FontWeight.w400,
        ).withEpilogue,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: Colors.grey.shade300,
            width: 1,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: Colors.grey.shade300,
            width: 1,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: themeData.primaryColor,
            width: 1.5,
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        isDense: true,
      ),
      items: preferences.map((item) {
        return DropdownMenuItem<String>(
          value: item,
          child: Text(
            item,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black87,
              fontWeight: FontWeight.w400,
            ).withEpilogue,
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
            softWrap: false,
          ),
        );
      }).toList(),
      onChanged: _updateContentVisibility,
      isExpanded: true,
    );
  }

  Widget _buildCreatorCategoryDropdown() {
    List<String> categories = [
      "Music & Art",
      "Entertainment & Comedy",
      "History & Literacy",
      "General Education",
      "Food & Cooking",
      "Lifestyle & Wellness",
      "Travel & Israel",
      "Business & Finance",
      "Relationships & Parenting",
      "Torah Study",
      "Fitness & Health",
    ];

    return DropdownButtonFormField<String>(
      value: categories.contains(selectedCreatorCategory) ? selectedCreatorCategory : null,
      decoration: InputDecoration(
        hintText: "Select a category",
        hintStyle: TextStyle(
          fontSize: 14,
          color: Colors.grey.shade500,
          fontWeight: FontWeight.w400,
        ).withEpilogue,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: Colors.grey.shade300,
            width: 1,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: Colors.grey.shade300,
            width: 1,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: themeData.primaryColor,
            width: 1.5,
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        isDense: true,
      ),
      items: categories
          .map(
            (item) => DropdownMenuItem<String>(
              value: item,
              child: Text(
                item,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.black87,
                  fontWeight: FontWeight.w400,
                ).withEpilogue,
              ),
            ),
          )
          .toList(),
      onChanged: _updateCreatorCategory,
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
}
