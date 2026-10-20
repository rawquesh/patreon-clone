import 'package:flutter/material.dart';
import 'package:patreon_clone/config/index.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon_clone/backend/creator_section/my_creator_page_controller.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'package:patreon_clone/backend/authentication/authentication_provider.dart';
// Make sure to import your LoadingWidget

class PublishCreatorScreen extends StatefulWidget {
  final String onboardingUrl;

  const PublishCreatorScreen({super.key, required this.onboardingUrl});

  @override
  State<PublishCreatorScreen> createState() => _PublishCreatorScreenState();
}

class _PublishCreatorScreenState extends State<PublishCreatorScreen> {
  late final WebViewController _webController;
  late final MyCreatorPageController _controller;

  // 1. Add a state variable to track loading.
  bool _isPageLoading = true;

  @override
  void initState() {
    super.initState();
    context.read<AuthenticationProvider>();
    _controller = MyCreatorPageController();
    _webController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: _handleNavigation,
          // 2. Set loading state to false when the page is finished.
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isPageLoading = false;
              });
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.onboardingUrl));
  }

  Future<void> _handleNavigation(String url) async {
    MyPrint.printOnConsole("_handleNavigation:$url");

    // Stripe onboarding completion URL

    if (url.contains('${AppConfig.frontendDomain}/profile')) {
      await _controller.completeStripeOnboarding();
      if (mounted) Navigator.of(context).pop(true);
    } else if (url == "${AppConfig.frontendDomain}/creator/stripe/complete") {
      if (mounted) Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    var top = MediaQuery.of(context).padding.top;

    return Scaffold(
      body: Padding(
        padding: EdgeInsets.only(top: top),
        // 3. Use a Stack to overlay the loader on the webview.
        child: Stack(
          children: [
            // The WebView is always in the stack, at the bottom.
            WebViewWidget(controller: _webController),

            // 4. Conditionally show the loader on top.
            if (_isPageLoading)
              const LoadingWidget(
                isCenter: true, // This will center your loader
              ),
          ],
        ),
      ),
    );
  }
}
