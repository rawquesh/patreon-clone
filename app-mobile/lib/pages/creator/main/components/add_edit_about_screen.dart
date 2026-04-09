import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:html_editor_enhanced/html_editor.dart';
import 'package:patreon-clone/config/index.dart';
import 'package:patreon-clone/models/social_link/social_links.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/styles/font_manager.dart';

import 'package:patreon-clone/backend/creator_section/my_creator_page_controller.dart';

class AddEditAboutScreen extends StatefulWidget {
  final String? initialIntroVideo;
  final String? initialBio;
  final List<SocialLinkModel> initialSocialLinks;

  const AddEditAboutScreen({
    super.key,
    this.initialIntroVideo,
    this.initialBio,
    required this.initialSocialLinks,
  });

  @override
  State<AddEditAboutScreen> createState() => _AddEditAboutScreenState();
}

class _AddEditAboutScreenState extends State<AddEditAboutScreen> with MySafeState {
  late TextEditingController _introVideoController;
  late HtmlEditorController _htmlController;
  late Map<String, TextEditingController> _socialControllers;
  late MyCreatorPageController _myCreatorPageController;
  bool _isLoading = false;

  final List<Map<String, dynamic>> _platforms = [
    {'platform': 'youtube', 'label': 'YouTube', 'icon': FontAwesomeIcons.youtube, 'placeholder': AppConfig.socialLinkHintYoutube},
    {'platform': 'instagram', 'label': 'Instagram', 'icon': FontAwesomeIcons.instagram, 'placeholder': AppConfig.socialLinkHintInstagram},
    {'platform': 'twitter', 'label': 'Twitter', 'icon': FontAwesomeIcons.xTwitter, 'placeholder': AppConfig.socialLinkHintTwitter},
    {'platform': 'facebook', 'label': 'Facebook', 'icon': FontAwesomeIcons.facebook, 'placeholder': AppConfig.socialLinkHintFacebook},
    {'platform': 'tiktok', 'label': 'TikTok', 'icon': FontAwesomeIcons.tiktok, 'placeholder': AppConfig.socialLinkHintTiktok},
    {'platform': 'twitch', 'label': 'Twitch', 'icon': FontAwesomeIcons.twitch, 'placeholder': AppConfig.socialLinkHintTwitch},
  ];

  @override
  void initState() {
    super.initState();
    _myCreatorPageController = MyCreatorPageController();
    _introVideoController = TextEditingController(text: widget.initialIntroVideo ?? '');
    _htmlController = HtmlEditorController();
    _socialControllers = {};

    for (var platform in _platforms) {
      String platformKey = platform['platform'];
      final existingLink = widget.initialSocialLinks.firstWhere(
        (link) => link.platform == platformKey,
        orElse: () => SocialLinkModel(platform: platformKey, url: ''),
      );
      _socialControllers[platformKey] = TextEditingController(text: existingLink.url);
    }
  }

  @override
  void dispose() {
    _introVideoController.dispose();
    for (var controller in _socialControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    final bioContent = await _htmlController.getText();
    final updatedLinks = _platforms
        .map((platform) {
          final platformKey = platform['platform'] as String;
          final url = _socialControllers[platformKey]!.text.trim();
          return SocialLinkModel(platform: platformKey, url: url);
        })
        .where((link) => link.url.isNotEmpty)
        .toList();

    final success = await _myCreatorPageController.updateAbout(
      introVideoUrl: _introVideoController.text.trim(),
      bio: bioContent,
      socialLinks: updatedLinks,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        MyToast.showSuccess(context: context, msg: 'About page updated successfully!');
        Navigator.pop(context, true); // Pop with a result to indicate success
      } else {
        MyToast.showError(context: context, msg: 'Failed to update about page.');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text('Edit About Page', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600).withTiempos),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleSave,
              style: ElevatedButton.styleFrom(
                backgroundColor: themeData.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              ),
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Text('Save', style: const TextStyle(fontWeight: FontWeight.bold).withEpilogue),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader('Intro Video'),
            _buildTextField(
              controller: _introVideoController,
              hint: 'e.g., youtube.com/... or vimeo.com/...',
              icon: Icons.play_circle_outline,
            ),
            const SizedBox(height: 24),
            _buildSectionHeader('About Me / Bio'),
            Container(
              height: 400, // Bigger bio input
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(8),
              ),
              child: HtmlEditor(
                controller: _htmlController,
                htmlEditorOptions: HtmlEditorOptions(
                  hint: "Tell your audience about yourself...",
                  initialText: widget.initialBio,
                ),
                htmlToolbarOptions: const HtmlToolbarOptions(
                  toolbarPosition: ToolbarPosition.aboveEditor,
                  toolbarType: ToolbarType.nativeScrollable,
                  defaultToolbarButtons: [
                    StyleButtons(),
                    FontSettingButtons(fontSize: false, fontName: false),
                    ListButtons(listStyles: false),
                    ParagraphButtons(textDirection: false, lineHeight: false, caseConverter: false),
                    InsertButtons(video: false, audio: false, table: false, hr: false, otherFile: false),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            _buildSectionHeader('Social Links'),
            ..._platforms.map((platform) => Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: _buildTextField(
                    controller: _socialControllers[platform['platform']]!,
                    hint: platform['placeholder'],
                    icon: platform['icon'],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ).withEpilogue,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, color: Colors.grey.shade600, size: 20),
        hintStyle: TextStyle(color: Colors.grey.shade500),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: themeData.primaryColor, width: 1.5),
        ),
      ),
    );
  }
}
