import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
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
    color: Color(0xff1E6FBF),
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
              const Text('Patreon Clone Terms of Service', style: _AppStyles.heading1),
              const SizedBox(height: 8),
              const Text('Effective Date: March 1, 2025', style: _AppStyles.effectiveDate),
              const SizedBox(height: 24),
              const Text(
                'Welcome to Patreon Clone! Patreon Clone is a platform that empowers Jewish content creators to build, engage, and monetize their communities. By using Patreon Clone, you agree to these Terms of Service ("Terms"), which govern your access to and use of our platform, website, and related services ("Services").',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 32),
              const Text('1. Account Creation & Responsibilities', style: _AppStyles.heading2),
              const SizedBox(height: 24),
              const Text('1.1 Eligibility:', style: _AppStyles.subheading),
              const _BulletPoint(
                  text:
                      'You must be at least 13 years old to create an account. If you are under 18, you may only use Patreon Clone with parental or guardian permission.'),
              const _BulletPoint(text: 'If you create an account as a content creator, you must be at least 18 years old.'),
              const SizedBox(height: 24),
              const Text('1.2 Account Security:', style: _AppStyles.subheading),
              const _BulletPoint(text: 'You are responsible for maintaining the confidentiality of your account credentials.'),
              const _BulletPoint(text: 'Notify us immediately if you suspect unauthorized use of your account.'),
              const SizedBox(height: 24),
              const Text('1.3 Account Termination:', style: _AppStyles.subheading),
              const _BulletPoint(text: 'You may delete your account at any time through your settings.'),
              const _BulletPoint(
                  text:
                      'Patreon Clone reserves the right to suspend or terminate accounts that violate our policies or for other reasons deemed necessary.'),
              const SizedBox(height: 32),
              const Text('2. User Types & Access Levels', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              const Text(
                'Patreon Clone has three primary user types:',
                style: _AppStyles.bodyText,
              ),
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
              const Text(
                'Creators are responsible for reporting and paying applicable taxes on their earnings. Patreon Clone may collect tax-related information as required by law.',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 32),
              const Text('4. Content Guidelines', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              const Text(
                'Creators are responsible for reporting and paying applicable taxes on their earnings. Patreon Clone may collect tax-related information as required by law.',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 32),
              const Text('10. Contact Information', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              const Text(
                'For questions about these Terms, contact us at support@patreon-clone.example.com.',
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
