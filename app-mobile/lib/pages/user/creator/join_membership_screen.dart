import 'dart:async';

import 'package:flutter/material.dart';
import 'package:patreon_clone/config/index.dart';
import 'package:patreon_clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon_clone/backend/memberships/membership_provider.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'package:patreon_clone/backend/memberships/membership_controller.dart';

class JoinMembershipScreen extends StatefulWidget {
  final String membershipId;
  final String creatorId;

  const JoinMembershipScreen({super.key, required this.membershipId, required this.creatorId});

  @override
  State<JoinMembershipScreen> createState() => _JoinMembershipScreenState();
}

class _JoinMembershipScreenState extends State<JoinMembershipScreen> {
  late MembershipController _controller;
  late MembershipProvider _provider;
  late final WebViewController _webController;
  String? _checkoutUrl;

  // 1. ADD a state variable for page loading.
  bool _isPageLoading = true;

  @override
  void initState() {
    super.initState();
    _provider = context.read<MembershipProvider>();
    _controller = MembershipController(provider: _provider);
    _webController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        // 2. UPDATE the navigation delegate.
        NavigationDelegate(
          onPageStarted: _handleNavigation,
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isPageLoading = false;
              });
            }
          },
        ),
      );
    _loadCheckout();
  }

  Future<void> _loadCheckout() async {
    final url = await _controller.createCheckout(widget.membershipId);
    if (url != null && mounted) {
      setState(() {
        _checkoutUrl = url;
        _webController.loadRequest(Uri.parse(url));
      });
    }
  }

  void _handleNavigation(String url) {
    if (!mounted) return;
    setState(() {
      _isPageLoading = true;
    });

    if (url.contains('subscription_success=true')) {
      Navigator.of(context).pop(true);
    } else if (url == "${AppConfig.frontendDomain}/") {
      Navigator.of(context).pop(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // This handles the initial loading for getting the checkout URL.
    if (_checkoutUrl == null) {
      return const Scaffold(
        body: Center(
          child: LoadingWidget(),
        ),
      );
    }

    // This handles the rendering after we have the URL.
    var top = MediaQuery.of(context).padding.top;
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.only(top: top),
        // 3. USE a Stack to show the loader over the webview.
        child: Stack(
          children: [
            WebViewWidget(controller: _webController),
            // Conditionally show the loader widget while the page is loading.
            if (_isPageLoading) const LoadingWidget(),
          ],
        ),
      ),
    );
  }
}
