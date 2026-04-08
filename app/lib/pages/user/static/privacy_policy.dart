import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:patreon-clone/styles/styles.dart';
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

// --- Privacy Policy Screen Widget ---
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        centerTitle: true,
        backgroundColor: Styles.scaffoldBackground,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Patreon Clone Privacy Policy', style: _AppStyles.heading1),
              const SizedBox(height: 8),
              const Text('Effective Date: March 1, 2025', style: _AppStyles.effectiveDate),
              const SizedBox(height: 24),
              const Text(
                'Patreon Clone ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use our website, applications, and services (collectively, the "Services"). By using Patreon Clone, you agree to the terms of this Privacy Policy. If you do not agree with this policy, please discontinue use of our Services.',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 16),
              const Text(
                'We may update this Privacy Policy from time to time. If we make significant changes, we will notify you by updating the date at the top of this page and, if necessary, through additional notifications.',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 32),
              const Text('1. Information We Collect', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              const Text(
                'We collect different types of information depending on how you interact with Patreon Clone.',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 24),
              const Text('A. Information You Provide Directly', style: _AppStyles.subheading),
              const SizedBox(height: 12),
              const Text(
                'You may provide personal information to us when you:',
                style: _AppStyles.bodyText,
              ),
              const _BulletPoint(text: 'Create an account'),
              const _BulletPoint(text: 'Join or interact with communities'),
              const _BulletPoint(text: 'Subscribe to or support a creator'),
              const _BulletPoint(text: 'Post, comment, or send messages'),
              const _BulletPoint(text: 'Contact customer support'),
              const _BulletPoint(text: 'Participate in surveys or promotions'),
              const SizedBox(height: 12),
              const Text(
                'This information may include:',
                style: _AppStyles.bodyText,
              ),
              const _BulletPoint(
                  title: 'Account Information:', text: 'Your name, email address, username, password, and profile details.'),
              const _BulletPoint(
                  title: 'Payment Information:',
                  text:
                      'If you subscribe or make purchases, our third-party payment processors (e.g., Stripe, PayPal) handle your payment data. Patreon Clone does not store your full payment details.'),
              const _BulletPoint(
                  title: 'Profile Information:',
                  text:
                      'Any information you voluntarily add to your profile, such as a bio, profile picture, location, or social media links.'),
              const _BulletPoint(
                  title: 'Content and Communications:', text: 'Any posts, comments, or messages you create on the platform.'),
              const SizedBox(height: 24),
              const Text('B. Information We Collect Automatically', style: _AppStyles.subheading),
              const SizedBox(height: 12),
              const Text(
                'When you use Patreon Clone, we automatically collect certain information, including:',
                style: _AppStyles.bodyText,
              ),
              const _BulletPoint(
                  title: 'Device and Usage Information:',
                  text:
                      'Your IP address, browser type, device type, operating system, and usage details such as page views, clicks, and time spent on the platform.'),
              const _BulletPoint(
                  title: 'Cookies and Tracking Technologies:',
                  text:
                      'We use cookies and similar technologies to remember your preferences, improve user experience, and analyze website traffic. You can manage cookie preferences through your browser settings.'),
              const SizedBox(height: 24),
              const Text('C. Information from Third Parties', style: _AppStyles.subheading),
              const SizedBox(height: 12),
              const Text(
                'If you connect Patreon Clone with third-party services (e.g., social media accounts), we may receive information from those platforms, including:',
                style: _AppStyles.bodyText,
              ),
              const _BulletPoint(text: 'Your public profile details'),
              const _BulletPoint(text: 'Your username and account ID'),
              const _BulletPoint(text: 'Engagement data (e.g., likes, follows)'),
              const SizedBox(height: 12),
              const Text(
                'We encourage you to review the privacy policies of any third-party services you link to Patreon Clone.',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 32),
              const Text('2. How We Use Your Information', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              const Text(
                'We use your information for the following purposes:',
                style: _AppStyles.bodyText,
              ),
              const _BulletPoint(title: 'Account Management:', text: 'Creating and managing your Patreon Clone account.'),
              const _BulletPoint(
                  title: 'Community Engagement:',
                  text: 'Enabling you to participate in discussions, support creators, and engage with content.'),
              const _BulletPoint(
                  title: 'Security & Fraud Prevention:',
                  text: 'Protecting against fraudulent activities and ensuring platform security.'),
              const _BulletPoint(
                  title: 'Personalization:', text: 'Customizing your experience, including content recommendations.'),
              const _BulletPoint(
                  title: 'Communication:', text: 'Sending you notifications, updates, and customer support messages.'),
              const _BulletPoint(
                  title: 'Legal Compliance:',
                  text: 'Complying with applicable laws, responding to legal requests, and enforcing our terms.'),
              const SizedBox(height: 16),
              const Text(
                'We do not sell your personal information to third parties.',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 32),
              const Text('3. Information Sharing & Disclosure', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              const Text(
                'We share your information only in the following circumstances:',
                style: _AppStyles.bodyText,
              ),
              const SizedBox(height: 24),
              const Text('4. Your Privacy Choices', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              const Text(
                'You have control over your personal information:',
                style: _AppStyles.bodyText,
              ),
              const _BulletPoint(title: 'Access & Update:', text: 'You can view and edit your profile information at any time.'),
              const _BulletPoint(
                  title: 'Delete Your Account:',
                  text:
                      'You may request to delete your account and associated data. Some data may be retained for legal compliance.'),
              const _BulletPoint(
                  title: 'Opt-Out of Marketing:',
                  text: 'You can unsubscribe from promotional emails using the "unsubscribe" link in the email.'),
              const _BulletPoint(title: 'Manage Cookies:', text: 'You can disable cookies through your browser settings.'),
              const SizedBox(height: 32),
              const Text('12. Contact Us', style: _AppStyles.heading2),
              const SizedBox(height: 16),
              const Text(
                'If you have questions about this Privacy Policy or your data rights, contact us at:',
                style: _AppStyles.bodyText,
              ),
              const _BulletPoint(title: 'Email:', text: 'privacy@patreon-clone.example.com', isLink: true),
              const _BulletPoint(title: 'Mailing Address:', text: '123 Community Way, San Francisco, CA 94105'),
              SizedBox(height: MediaQuery.of(context).padding.bottom)
            ],
          ),
        ),
      ),
    );
  }
}

// --- Helper Widget for Bullet Points ---
class _BulletPoint extends StatelessWidget {
  final String? title;
  final String text;
  final bool isLink;

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
                      text: title,
                      style: _AppStyles.bulletText.copyWith(fontWeight: FontWeight.w600),
                    ),
                  TextSpan(
                    text: ' ${isLink ? text : text}',
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
