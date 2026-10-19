/// Centralized app configuration.
///
/// A buyer only needs to change values here to rebrand the entire application.
///
/// ## How to rebrand:
///
/// 1. **App identity**: Change `appName`, `appTagline`, `companyName`
/// 2. **API**: Change `apiServerUrl` to point to your backend
/// 3. **Frontend domain**: Change `frontendDomain` (used for share links, legal pages, Stripe redirects)
/// 4. **Colors**: Change the color constants
/// 5. **Contact**: Change `supportEmail`, `privacyEmail`
/// 6. **Firebase**: Replace the values in `FirebaseConfig` with your own project credentials
/// 7. **Assets**: Replace the logo PNG in `assets/images/` (keep filename or update `logoAssetPath`)
///
/// Config is split into:
///   - `app_config.dart`  — all raw values (safe to edit)
///   - `index.dart`       — barrel re-exports
library;

import 'package:flutter/material.dart';

class AppConfig {
  AppConfig._();

  // ─────────────────────────────────────────────────────────────
  // APP IDENTITY
  // ─────────────────────────────────────────────────────────────

  /// Display name shown in app bar, splash, login header, etc.
  static const String appName = "Patreon Clone";

  /// Short tagline used in share text and legal docs.
  static const String appTagline = "Build a thriving Jewish Community online";

  /// Legal / copyright entity name.
  static const String companyName = "Patreon Clone";

  // ─────────────────────────────────────────────────────────────
  // URLS
  // ─────────────────────────────────────────────────────────────

  /// Backend API server base URL.
  static const String apiServerUrl = "https://your-backend-server.example.com";

  /// Primary frontend domain (no trailing slash).
  /// Used for: share links, ToS/Privacy page URLs, Stripe redirect domains.
  /// Example: "https://myplatform.com"
  static const String frontendDomain = "https://www.patreon-clone.example.com";

  /// Terms of Service page URL (derived from frontendDomain).
  static const String termsOfServiceUrl = "$frontendDomain/tos";

  /// Privacy Policy page URL (derived from frontendDomain).
  static const String privacyPolicyUrl = "$frontendDomain/privacy-policy";

  // ─────────────────────────────────────────────────────────────
  // CONTACT
  // ─────────────────────────────────────────────────────────────

  /// Support / help email shown on login screen.
  static const String supportEmail = "support@patreon-clone.example.com";

  /// Privacy-related contact email shown in Privacy Policy.
  static const String privacyEmail = "privacy@patreon-clone.example.com";

  // ─────────────────────────────────────────────────────────────
  // BRAND COLORS  (Flutter Color objects)
  // ─────────────────────────────────────────────────────────────

  static const Color primaryColor = Color(0xFF1D70BF);
  static const Color primaryColorHover = Color(0xFF3283D1);
  static const Color primaryColorDark = Color(0xFF1962A5);

  static const Color accentColor = Color(0xFFCB785C);
  static const Color accentColorDark = Color(0xFFAB5437);

  static const Color successColor = Color(0xFF38A169);
  static const Color likeColor = Color(0xFFE92145);

  static const Color scaffoldBackground = Color(0xFFF7F5ED);
  static const Color linkColor = Color(0xFF1E6FBF);

  // ─────────────────────────────────────────────────────────────
  // SHARE URLS
  // Used throughout the app when sharing posts or creator profiles.
  // The domain portion comes from `frontendDomain`.
  // ─────────────────────────────────────────────────────────────

  /// Base path for post share links.
  static const String postSharePath = "/post";

  /// Base path for creator profile share links.
  static const String creatorSharePath = "/creator";

  // ─────────────────────────────────────────────────────────────
  // ASSETS
  // ─────────────────────────────────────────────────────────────

  /// Relative path to the app logo image (under `assets/`).
  /// The buyer replaces the image file while keeping this path,
  /// or updates this value if they rename the file.
  static const String logoAssetPath = "assets/images/patreon-clone_logo.png";

  // ─────────────────────────────────────────────────────────────
  // LEGAL TEMPLATE STRINGS
  // These strings are substituted into the ToS / Privacy Policy pages.
  // The placeholder `{appName}` / `{companyName}` / `{supportEmail}`
  // in the source files are replaced with actual config values.
  // ─────────────────────────────────────────────────────────────

  static const String legalEffectiveDate = "March 1, 2025";

  static const String tosWelcomeBody =
      "Welcome to {appName}! {appName} is a platform that empowers Jewish content creators "
      "to build, engage, and monetize their communities. By using {appName}, you agree to these "
      "Terms of Service (\"Terms\"), which govern your access to and use of our platform, website, "
      "and related services (\"Services\").";

  static const String tosEligibilityMinor =
      "You must be at least 13 years old to create an account. If you are under 18, you may "
      "only use {appName} with parental or guardian permission.";

  static const String tosEligibilityCreator =
      "If you create an account as a content creator, you must be at least 18 years old.";

  static const String tosTermination =
      "{appName} reserves the right to suspend or terminate accounts that violate our policies "
      "or for other reasons deemed necessary.";

  static const String tosUserTypesIntro = "{appName} has three primary user types:";

  static const String tosAccountManagement = "Creating and managing your {appName} account.";

  static const String tosCommunityEngagement =
      "Enabling you to participate in discussions, support creators, and engage with content.";

  static const String tosSecurityFraud =
      "Protecting against fraudulent activities and ensuring platform security.";

  static const String tosPersonalization = "Customizing your experience, including content recommendations.";

  static const String tosCommunication =
      "Sending you notifications, updates, and customer support messages.";

  static const String tosLegalCompliance =
      "Complying with applicable laws, responding to legal requests, and enforcing our terms.";

  static const String tosTaxResponsibility =
      "Creators are responsible for reporting and paying applicable taxes on their earnings. "
      "{appName} may collect tax-related information as required by law.";

  static const String privacyIntro =
      "{appName} (\"we,\" \"us,\" or \"our\") is committed to protecting your privacy. This Privacy "
      "Policy describes how we collect, use, and share your personal information when you use our "
      "website, applications, and services (collectively, the \"Services\"). By using {appName}, you "
      "agree to the terms of this Privacy Policy. If you do not agree with this policy, please "
      "discontinue use of our Services.";

  static const String privacyMailingAddress = "123 Community Way, San Francisco, CA 94105";

  // ─────────────────────────────────────────────────────────────
  // ONBOARDING CONSENT TEXT
  // ─────────────────────────────────────────────────────────────

  static const String creatorConsentText =
      "By creating an account and checking this box, you are providing your written agreement with, "
      "and consent to, (1) the {appName} Privacy Policy, which cover your use of the {appName} "
      "website and apps and can be found here: Privacy Policy and (2) the {appName} Terms of Service, "
      "which cover your use of the {appName} website and apps and can be found here: Terms of Service";

  // ─────────────────────────────────────────────────────────────
  // SOCIAL SHARING URLs  (external, third-party)
  // ─────────────────────────────────────────────────────────────

  static const String twitterShareBase = "https://twitter.com/intent/tweet";
  static const String facebookShareBase = "https://www.facebook.com/sharer/sharer.php";
  static const String whatsappShareBase = "https://wa.me";
  static const String instagramFallback = "https://instagram.com";

  // ─────────────────────────────────────────────────────────────
  // SOCIAL LINK PLACEHOLDER PATTERNS  (shown as hints in edit forms)
  // ─────────────────────────────────────────────────────────────

  static const String socialLinkHintYoutube = "youtube.com/channel/...";
  static const String socialLinkHintInstagram = "instagram.com/username";
  static const String socialLinkHintTwitter = "twitter.com/username";
  static const String socialLinkHintFacebook = "facebook.com/username";
  static const String socialLinkHintTiktok = "tiktok.com/@username";
  static const String socialLinkHintTwitch = "twitch.tv/username";
  static const String socialLinkHintWebsite = "yourwebsite.com";

  // ─────────────────────────────────────────────────────────────
  // MISC
  // ─────────────────────────────────────────────────────────────

  /// Niche reference in country list — customize to your community.
  /// Currently used as a display label for the Jewish-population country ordering.
  static const String nicheCountryListKey = "Jewish";

  /// Country codes shown at the top of the country picker.
  /// Ordered by the target community's population density.
  static const List<String> suggestedCountryCodes = ['IL', 'US', 'FR', 'CA', 'GB', 'AR', 'RU', 'AU', 'DE', 'BR'];

  /// Share text prefix for membership welcome dialog.
  static const String membershipWelcomeText = "Welcome to the {appName}!";

  /// Fallback/placeholder image URL used when no user content is available.
  static const String placeholderImageUrl = "https://picsum.photos/400/400";

  /// Google Form URL for feature requests / contact (shown in profile settings).
  static const String featureRequestFormUrl = "https://forms.gle/c3NHFCMgJZDXaa6n8";

  /// Label for the main social feed / community tab in the bottom navigation.
  static const String communityTabLabel = "Community";

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  /// Interpolate legal string placeholders.
  static String _legal(String template) {
    return template
        .replaceAll('{appName}', appName)
        .replaceAll('{companyName}', companyName)
        .replaceAll('{domain}', frontendDomain.replaceAll('https://', '').replaceAll('http://', '').replaceAll('www.', ''));
  }

  /// Returns the interpolated ToS body text.
  static String tosWelcome() => _legal(tosWelcomeBody);
  static String tosEligibility() => _legal(tosEligibilityMinor);
  static String tosEligibilityCreatorText() => _legal(tosEligibilityCreator);
  static String tosTerminationText() => _legal(tosTermination);
  static String tosUserTypes() => _legal(tosUserTypesIntro);
  static String tosAccountMgmt() => _legal(tosAccountManagement);
  static String tosCommunity() => _legal(tosCommunityEngagement);
  static String tosSecurity() => _legal(tosSecurityFraud);
  static String tosPersonalize() => _legal(tosPersonalization);
  static String tosComms() => _legal(tosCommunication);
  static String tosLegal() => _legal(tosLegalCompliance);
  static String tosTax() => _legal(tosTaxResponsibility);
  static String privacyWelcome() => _legal(privacyIntro);
  static String membershipWelcome() => _legal(membershipWelcomeText);
  static String creatorConsent() => _legal(creatorConsentText);

  /// Build a post share URL.
  static String postShareUrl(String postId) =>
      '${frontendDomain.replaceAll('/www.', '/')}$postSharePath/$postId';

  /// Build a creator share URL.
  static String creatorShareUrl(String username) =>
      '${frontendDomain.replaceAll('/www.', '/')}$creatorSharePath/$username';

  /// Build a creator website URL string (displayed in profile).
  static String creatorWebsiteUrl(String username) =>
      '${frontendDomain.replaceAll('https://www.', '')}/creator/$username';
}

/// Firebase platform credentials — replace all values with your own project config.
class FirebaseConfig {
  const FirebaseConfig._();

  // Android
  static const String androidApiKey = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXX';
  static const String androidAppId = '1:00000000000:android:xxxxxxxxxxxxxxxxxxxxxxxx';
  static const String androidMessagingSenderId = '00000000000';
  static const String androidProjectId = 'your-firebase-project-id';
  static const String androidStorageBucket = 'your-firebase-project.firebasestorage.app';
  static const String androidClientId = '00000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com';

  // iOS
  static const String iosApiKey = 'AIzaSyXXXXXXXXXXXXXXXXXXXXXX';
  static const String iosAppId = '1:00000000000:ios:xxxxxxxxxxxxxxxxxxxxxxxx';
  static const String iosMessagingSenderId = '00000000000';
  static const String iosProjectId = 'your-firebase-project-id';
  static const String iosStorageBucket = 'your-firebase-project.firebasestorage.app';
  static const String iosClientId = '00000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com';
  static const String iosBundleId = 'com.example.patreonclone';

  // Shared
  static const String messagingSenderId = '00000000000';
}
