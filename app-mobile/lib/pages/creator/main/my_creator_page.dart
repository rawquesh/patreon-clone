import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';
import 'package:patreon-clone/backend/creator_section/my_creator_page_controller.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/creator/main/dialogs/publish_creator_page_dialog.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/authentication/authentication_repository.dart';
import 'components/creator_tab_section.dart';

class MyCreatorPage extends StatefulWidget {
  static const String routeName = '/MyCreatorPage';

  const MyCreatorPage({super.key});

  @override
  State<MyCreatorPage> createState() => _MyCreatorPageState();
}

class _MyCreatorPageState extends State<MyCreatorPage> with SingleTickerProviderStateMixin, MySafeState {
  late AuthenticationProvider authenticationProvider;
  bool isCreatorPublished = true;

  @override
  void initState() {
    super.initState();
    authenticationProvider = context.read<AuthenticationProvider>();
    _loadPublishStatus();
  }

  Future<void> _loadPublishStatus() async {
    MyPrint.printOnConsole("Loading publish status for creator page");
    final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
    if (token == null || token.isEmpty) return;

    final userResult = await AuthenticationRepository().getUserFromToken(token);
    if (userResult.isSuccess && userResult.data != null) {
      final user = userResult.data!;
      MyPrint.printOnConsole("Fetched userModel: $user, Fetched user: ${user.userId}, creatorStatus: ${user.creatorStatus}");
      authenticationProvider.userModel.set(value: user, isNotify: true);
      MyPrint.printOnConsole("user creatorStatus: ${user.creatorStatus}");
      isCreatorPublished = user.creatorStatus.toLowerCase() == 'published';
      mySetState();
    }
    MyPrint.printOnConsole("isCreatorPublished: $isCreatorPublished");
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> showPublishCreatorPageDialog(
    BuildContext context, {
    VoidCallback? onCancel,
    Function(bool)? onContinue,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return PublishCreatorPageDialog(
          onCancel: onCancel,
          onContinue: onContinue,
        );
      },
    );
  }

  Future<void> _startPublishCreatorFlow() async {
    final url = await MyCreatorPageController().publishCreator(acceptTerms: true);
    Navigator.of(context).pop();

    if (url == null) {
      _showErrorSnackBar('Failed to start publish process');
      return;
    }

    final result = await context.pushNamed<bool>(
      Routes.publishCreator,
      extra: url,
    );

    if (result == true) {
      MyPrint.printOnConsole(isCreatorPublished);
      await _loadPublishStatus();
      MyPrint.printOnConsole(isCreatorPublished);
      if (isCreatorPublished) {
        _showSuccessSnackBar('Page published successfully');
      } else {
        _showErrorSnackBar('Onboarding incomplete');
      }
    } else {
      _showErrorSnackBar('Onboarding cancelled');
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      body: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          const CreatorTabbedSection(),
          _buildPublishWarning(),
        ],
      ),
    );
  }

  Widget _buildPublishWarning() {
    if (isCreatorPublished) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: themeData.colorScheme.primary,
        border: Border.all(
          color: themeData.primaryColor.withValues(alpha: 0.5),
          width: 1,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(
            CupertinoIcons.exclamationmark_triangle,
            color: themeData.colorScheme.onPrimary,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Page Not Published',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: themeData.colorScheme.onPrimary,
                  ).withEpilogue,
                ),
                Text(
                  'Publish to go live and accept funds',
                  style: TextStyle(
                    fontSize: 11,
                    color: themeData.colorScheme.onPrimary,
                  ).withEpilogue,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () {
              showPublishCreatorPageDialog(
                context,
                onCancel: () {
                  Navigator.of(context).pop();
                },
                onContinue: (isAgreed) {
                  MyPrint.printOnConsole('User agreed and continuing to Stripe');
                  if (isAgreed) {
                    _startPublishCreatorFlow();
                  }
                },
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: themeData.colorScheme.onPrimary,
              foregroundColor: themeData.primaryColor,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              minimumSize: const Size(0, 32),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            child: Text(
              'Publish',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ).withEpilogue,
            ),
          ),
        ],
      ),
    );
  }
}
