import 'package:flutter/material.dart';
import 'package:patreon-clone/config/index.dart';
import 'package:patreon-clone/models/social_link/social_links.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/styles/font_manager.dart';

import 'package:patreon-clone/backend/creator_section/my_creator_page_controller.dart';

class EditSocialLinksDialog extends StatefulWidget {
  final List<SocialLinkModel> initialSocialLinks;
  final Function(List<SocialLinkModel>)? onSave;

  const EditSocialLinksDialog({
    super.key,
    required this.initialSocialLinks,
    this.onSave,
  });

  @override
  State<EditSocialLinksDialog> createState() => _EditSocialLinksDialogState();
}

class _EditSocialLinksDialogState extends State<EditSocialLinksDialog> with MySafeState {
  late Map<String, TextEditingController> controllers;
  late Map<String, String> socialLinks;
  late MyCreatorPageController myCreatorPageController;
  bool _isLoading = false;

  final List<Map<String, dynamic>> platforms = [
    {'platform': 'twitter', 'label': 'Twitter', 'icon': FontAwesomeIcons.xTwitter, 'placeholder': 'https://${AppConfig.socialLinkHintTwitter}'},
    {
      'platform': 'instagram',
      'label': 'Instagram',
      'icon': FontAwesomeIcons.instagram,
      'placeholder': 'https://${AppConfig.socialLinkHintInstagram}'
    },
    {'platform': 'tiktok', 'label': 'TikTok', 'icon': FontAwesomeIcons.tiktok, 'placeholder': 'https://${AppConfig.socialLinkHintTiktok}'},
    {
      'platform': 'youtube',
      'label': 'YouTube',
      'icon': FontAwesomeIcons.youtube,
      'placeholder': 'https://${AppConfig.socialLinkHintYoutube}'
    },
    {'platform': 'twitch', 'label': 'Twitch', 'icon': FontAwesomeIcons.twitch, 'placeholder': 'https://${AppConfig.socialLinkHintTwitch}'},
    {'platform': 'website', 'label': 'Website', 'icon': FontAwesomeIcons.globe, 'placeholder': 'https://${AppConfig.socialLinkHintWebsite}'},
  ];

  @override
  void initState() {
    super.initState();
    myCreatorPageController = MyCreatorPageController();
    _initializeControllers();
  }

  void _initializeControllers() {
    controllers = {};
    socialLinks = {};

    for (var platform in platforms) {
      String platformKey = platform['platform'];
      controllers[platformKey] = TextEditingController();
      socialLinks[platformKey] = '';

      // Set existing values
      final existingLink = widget.initialSocialLinks.firstWhere(
        (link) => link.platform == platformKey,
        orElse: () => SocialLinkModel(platform: platformKey, url: ''),
      );

      controllers[platformKey]!.text = existingLink.url;
      socialLinks[platformKey] = existingLink.url;
    }
  }

  @override
  void dispose() {
    for (var controller in controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (_isLoading) return;
    List<SocialLinkModel> updatedLinks = [];

    for (var platform in platforms) {
      String platformKey = platform['platform'];
      String url = controllers[platformKey]!.text.trim();

      if (url.isNotEmpty) {
        updatedLinks.add(SocialLinkModel(
          platform: platformKey,
          url: url,
        ));
      }
    }

    _isLoading = true;
    mySetState();

    final success = await myCreatorPageController.updateSocialLinks(updatedLinks);

    if (!mounted) return;

    _isLoading = false;
    mySetState();

    if (success) {
      MyToast.showSuccess(
        context: context,
        msg: 'Social links updated successfully',
      );
      widget.onSave?.call(updatedLinks);
      Navigator.pop(context);
    } else {
      MyToast.showError(
        context: context,
        msg: 'Failed to update social links',
      );
    }
  }

  Widget _buildSocialField(Map<String, dynamic> platform) {
    String platformKey = platform['platform'];

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.grey[200], // Slightly lighter grey for better contrast
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              platform['icon'],
              size: 20,
              color: Colors.black87,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: controllers[platformKey],
              decoration: InputDecoration(
                hintText: platform['placeholder'],
                hintStyle: TextStyle(
                  fontSize: 14, // Slightly larger for readability
                  color: Colors.grey[500],
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: Colors.grey[400]!), // Lighter border
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: Colors.grey[400]!), // Lighter border
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: themeData.primaryColor),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10, // Adjusted padding for better vertical alignment
                ),
                isDense: true,
              ),
              style: const TextStyle(fontSize: 14), // Match hint size
              onChanged: (value) {
                socialLinks[platformKey] = value.trim();
              },
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    // Use AlertDialog for a responsive layout that handles scrolling automatically.
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      backgroundColor: Colors.white, // Ensure a solid background
      // Title Section
      titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Edit your social links',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ).withEpilogue,
          ),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Icon(
              Icons.close,
              size: 24,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
      // Content Section
      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
      content: SizedBox(
        // Constrain the width for the scroll view
        width: double.maxFinite,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 10), // Add some top space
              ...platforms.map((platform) => _buildSocialField(platform)),
            ],
          ),
        ),
      ),
      // Actions (Footer) Section
      actionsPadding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.pop(context),
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(
              horizontal: 20,
              vertical: 10,
            ),
          ),
          child: Text(
            'Cancel',
            style: TextStyle(
              fontSize: 14,
              color: themeData.primaryColor,
              fontWeight: FontWeight.w500,
            ).withEpilogue,
          ),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _handleSave,
          style: ElevatedButton.styleFrom(
            backgroundColor: themeData.primaryColor,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: 12,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            elevation: 0,
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Text(
                  'Save Changes',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ).withEpilogue,
                ),
        ),
      ],
    );
  }
}
