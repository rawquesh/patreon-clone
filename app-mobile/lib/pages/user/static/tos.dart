import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:patreon-clone/config/index.dart';
import 'package:url_launcher/url_launcher.dart';

class _AppStyles {
  static const TextStyle heading1 = TextStyle(
    fontSize: 24.0,
    fontWeight: FontWeight.bold,
    color: Colors.black87,
    height: 1.5,
  );

  static const TextStyle heading2 = TextStyle(
    fontSize: 20.0,
    fontWeight: FontWeight.w700,
    color: Colors.black87,
    height: 1.8,
  );

  static const TextStyle subheading = TextStyle(
    fontSize: 16.0,
    fontWeight: FontWeight.w600,
    color: Colors.black87,
    height: 1.7,
  );

  static const TextStyle bodyText = TextStyle(
    fontSize: 15.0,
    color: Colors.black54,
    height: 1.6,
  );

  static const TextStyle effectiveDate = TextStyle(
    fontSize: 14.0,
    color: Colors.black45,
    fontStyle: FontStyle.italic,
    height: 1.6,
  );

  static const TextStyle bulletText = TextStyle(
    fontSize: 15.0,
    color: Colors.black54,
    height: 1.6,
  );

  static const TextStyle linkText = TextStyle(
    fontSize: 15.0,
    color: AppConfig.linkColor,
    decoration: TextDecoration.underline,
    height: 1.6,
  );
}

class TOSScreen extends StatelessWidget {
  const TOSScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms of Service'),
        centerTitle: true,
        foregroundColor: Colors.black87,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('${AppConfig.appName} Terms of Service', style: _AppStyles.heading1),
              const SizedBox(height: 8),
              const Text('Effective Date: ${AppConfig.legalEffectiveDate}', style: _AppStyles.effectiveDate),
              const SizedBox(height: 24),
              Text(AppConfig.tosWelcome(), style: _AppStyles.bodyText),
              const SizedBox(height: 32),
              const Text('1. Account Creation & Responsibilities', style: _AppStyles.heading2),
              const SizedBox(height: 24),
              const Text('1.1 Eligibility:', style: _AppStyles.subheading),
              _BulletPoint(text: AppConfig.tosEligibility()),
              _BulletPoint(text: AppConfig.tosEligibilityCreatorText()),
              const SizedBox(height: 24),
              const Text('1.2 Account Security:', style: _AppStyles.subheading),
              const _BulletPoint(text: 'You are responsible for maintaining the confidentiality of your account credentials.'),
              const _BulletPoint(text: 'Notify us immediately if you suspect unauthorized use of your account.'),
              const SizedBox(height: 24),
              const Text('1.3 Account Termination:', style: _AppStyles.subheading),
              const _BulletPoint(text: 'You may delete your account at any time through your settings.'),
              _BulletPoint(text: AppConfig.tosTerminationText()),
              const SizedBox(height: 32),
              const Text('2. User Types & Access Levels', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              Text(AppConfig.tosUserTypes(), style: _AppStyles.bodyText),
              const _BulletPoint(
                  title: 'Members:', text: 'Users who follow and support creators by subscribing to their content.'),
              const _BulletPoint(
                  title: 'Creators:', text: 'Users who share content and monetize their communities through subscriptions.'),
              const _BulletPoint(
                  title: 'Community Managers:',
                  text: 'Additional users designated by creators to help manage their communities.'),
              const SizedBox(height: 16),
              const Text(
                'Each user type has different access permissions. Members can subscribe, comment, and engage with content. Creators can upload content, set subscription tiers, and manage their communities. Community Managers share administrative privileges with creators but cannot remove the creator from their own account.',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 32),
              const Text('3. Subscriptions & Payments', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              Text(AppConfig.tosTax(), style: _AppStyles.bodyText),
              const SizedBox(height: 32),
              const Text('4. Content Guidelines', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              Text(AppConfig.tosTax(), style: _AppStyles.bodyText),
              const SizedBox(height: 32),
              const Text('10. Contact Information', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              const Text(
                'For questions about these Terms, contact us at ${AppConfig.supportEmail}.',
                style: _AppStyles.bodyText,
              ),
              SizedBox(height: MediaQuery.of(context).padding.bottom)
            ],
          ),
        ),
      ),
    );
  }
}

class _BulletPoint extends StatelessWidget {
  final String? title;
  final String text;
  final bool isLink;

  // ignore: unused_element_parameter
  const _BulletPoint({this.title, required this.text, this.isLink = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 16.0, top: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: _AppStyles.bulletText),
          Expanded(
            child: RichText(
              text: TextSpan(
                children: [
                  if (title != null)
                    TextSpan(
                      text: '$title ',
                      style: _AppStyles.bulletText.copyWith(fontWeight: FontWeight.w600),
                    ),
                  TextSpan(
                    text: text,
                    style: isLink ? _AppStyles.linkText : _AppStyles.bulletText,
                    recognizer: isLink ? (TapGestureRecognizer()..onTap = () => _launchUrl('mailto:$text')) : null,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

Future<void> _launchUrl(String url) async {
  if (await canLaunchUrl(Uri.parse(url))) {
    await launchUrl(Uri.parse(url), mode: LaunchMode.inAppBrowserView);
  }
}
