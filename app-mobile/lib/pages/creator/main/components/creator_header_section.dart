import 'dart:io';

// import 'package:external_app_launcher/external_app_launcher.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/config/index.dart';
import 'package:patreon-clone/navigation/app_router.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:image_picker/image_picker.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';
import 'package:patreon-clone/styles/styles.dart';
import 'package:patreon-clone/models/social_link/social_links.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/backend/creator_section/my_creator_page_controller.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/helpers/image_helper.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/authentication/authentication_repository.dart';
import 'package:patreon-clone/backend/user/my_user_controller.dart';
import 'package:patreon-clone/constants/app_constants.dart';
import '../dialogs/edit_social_links_dialog.dart';

class CreatorHeaderSection extends StatefulWidget {
  final ScrollController scrollController;
  final TabController tabController;

  const CreatorHeaderSection({
    super.key,
    required this.scrollController,
    required this.tabController,
  });

  @override
  State<CreatorHeaderSection> createState() => _CreatorHeaderSectionState();
}

class _CreatorHeaderSectionState extends State<CreatorHeaderSection> with MySafeState {
  late MyUserController myUserController;
  late AuthenticationProvider authenticationProvider;
  late MyCreatorPageController myCreatorPageController;

  File? coverImageFile;
  File? profileImageFile;
  String coverImageUrl = '';
  String profileImageUrl = '';
  String creatorUsername = '';
  String creatorDisplayName = '';
  String headline = 'Add headline';
  String websiteUrl = '';
  bool isUploadingCover = false;
  bool isUploadingProfile = false;
  List<SocialLinkModel> socialLinks = [];

  @override
  void initState() {
    super.initState();
    _initializeUserData();
  }

  Future<void> _initializeUserData() async {
    authenticationProvider = context.read<AuthenticationProvider>();
    myUserController = MyUserController(authenticationProvider: authenticationProvider);
    final userModel = authenticationProvider.userModel.get();
    myCreatorPageController = MyCreatorPageController();

    if (userModel != null) {
      profileImageUrl = userModel.profilePicture;
      coverImageUrl = userModel.profileCover;
      creatorUsername = userModel.creatorUsername;
      creatorDisplayName = userModel.displayName;
      headline = userModel.creatorHeadline.isNotEmpty ? userModel.creatorHeadline : 'Add headline';
      socialLinks = userModel.socialLinks;
    }

    await _loadUserStatus();
  }

  Future<void> _loadUserStatus() async {
    final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
    if (token == null || token.isEmpty) return;

    final result = await AuthenticationRepository().getUserFromToken(token);
    if (result.isSuccess && result.data != null) {
      final user = result.data!;
      authenticationProvider.userModel.set(value: user, isNotify: true);
      profileImageUrl = user.profilePicture;
      coverImageUrl = user.profileCover;
      creatorUsername = user.creatorUsername;
      creatorDisplayName = user.displayName;

      headline = user.creatorHeadline.isNotEmpty ? user.creatorHeadline : 'Add headline';
      websiteUrl = AppConfig.creatorWebsiteUrl(creatorUsername);
      socialLinks = user.socialLinks;
      mySetState();
    }
  }

  Future<void> _pickImage(ImageSource source, {required bool isCover}) async {
    try {
      var image = await ImageHelper.pickAndProcessImage(
          context: context, isCoverImage: isCover, isProfilePhoto: !isCover, source: source);

      if (image == null) return;

      final imageFile = File(image.path);
      if (!_validateImage(imageFile)) return;

      if (isCover) {
        isUploadingCover = true;
        mySetState();
        await _uploadCoverImage(imageFile);
        coverImageFile = imageFile;
        isUploadingCover = false;
        _showSuccessSnackBar('Cover image updated successfully');
      } else {
        isUploadingProfile = true;
        mySetState();
        await _uploadProfileImage(imageFile);
        profileImageFile = imageFile;
        isUploadingProfile = false;
        _showSuccessSnackBar('Profile image updated successfully');
      }

      mySetState();
    } catch (e) {
      isUploadingCover = false;
      isUploadingProfile = false;
      mySetState();
      _showErrorSnackBar('Error selecting image: ${e.toString()}');
    }
  }

  void _removeImage({required bool isCover}) {
    setState(() {
      if (isCover) {
        coverImageFile = null;
        coverImageUrl = '';
      } else {
        profileImageFile = null;
        profileImageUrl = '';
      }
    });
    _showSuccessSnackBar(isCover ? 'Cover image removed' : 'Profile image removed');
  }

  Future<void> _uploadCoverImage(File imageFile) async {
    final urlResult = await myUserController.uploadCoverImage(imageFile: imageFile);
    if (urlResult.isSuccess && urlResult.data != null && urlResult.data!.isNotEmpty) {
      coverImageUrl = urlResult.data!;
    } else {
      _showErrorSnackBar(urlResult.errorMessage ?? 'Failed to upload cover image');
    }
  }

  Future<void> _uploadProfileImage(File imageFile) async {
    final urlResult = await myUserController.uploadProfileImage(imageFile: imageFile);
    if (urlResult.isSuccess && urlResult.data != null && urlResult.data!.isNotEmpty) {
      profileImageUrl = urlResult.data!;
    } else {
      _showErrorSnackBar(urlResult.errorMessage ?? 'Failed to upload profile image');
    }
  }

  bool _validateImage(File imageFile) {
    const int maxSizeInBytes = 5 * 1024 * 1024;
    if (imageFile.lengthSync() > maxSizeInBytes) {
      _showErrorSnackBar('Image size must be less than 5MB');
      return false;
    }

    final extension = imageFile.path.split('.').last.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    if (!allowedExtensions.contains(extension)) {
      _showErrorSnackBar('Only JPG, JPEG, and PNG files are allowed');
      return false;
    }
    return true;
  }

  Future<void> _updateHeadline(String newHeadline) async {
    final result = await myUserController.updateCreatorHeadline(headline: newHeadline);
    if (result.isSuccess) {
      headline = newHeadline;
      _showSuccessSnackBar('Headline updated successfully');
      mySetState();
    } else {
      _showErrorSnackBar(result.errorMessage ?? 'Failed to update headline');
    }
  }

  Future<void> _launchUrl(String url) async {
    try {
      final Uri uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      } else {
        _showErrorSnackBar('Could not launch $url');
      }
    } catch (e) {
      _showErrorSnackBar('Error launching URL: ${e.toString()}');
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    // final screenHeight = MediaQuery.of(context).size.height;

    const double heightWithoutSocials = 370.0;
    const double heightWithSocials = 370.0;
    final double expandedHeight = socialLinks.isNotEmpty ? heightWithSocials : heightWithoutSocials;

    return SliverAppBar(
      backgroundColor: Styles.scaffoldBackground,
      expandedHeight: expandedHeight,
      pinned: true,
      stretch: true,
      elevation: 0,
      scrolledUnderElevation: 0,
      title: AnimatedBuilder(
        animation: widget.scrollController,
        builder: (context, child) {
          double offset = widget.scrollController.hasClients ? widget.scrollController.offset : 0;

          double opacity = (offset - 300).clamp(0, 50) / 50;
          return Opacity(
            opacity: opacity,
            child: RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: creatorDisplayName,
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ).withEpilogue,
                  ),
                  TextSpan(
                    text: '  Creator',
                    style: themeData.textTheme.labelSmall
                        ?.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.normal,
                          color: themeData.colorScheme.onSurface,
                        )
                        .withEpilogue,
                  ),
                ],
              ),
            ),
          );
        },
      ),
      centerTitle: true,
      actions: [
        AnimatedBuilder(
          animation: widget.scrollController,
          builder: (context, child) {
            double offset = widget.scrollController.hasClients ? widget.scrollController.offset : 0;
            double opacity = (offset - 300).clamp(0, 50) / 50;
            return Opacity(
              opacity: opacity,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: 5),
                    child: IconButton(
                      onPressed: _shareProfile,
                      icon: Image.asset(
                        AppAssets.shareIcon,
                        height: 20,
                        width: 20,
                        color: themeData.colorScheme.onSurface,
                      ),
                    ),
                  ),
                  // IconButton(
                  //   onPressed: _showMoreOptions,
                  //   icon: Image.asset(
                  //     AppAssets.more_icon,
                  //     height: 20,
                  //     width: 20,
                  //     color: themeData.colorScheme.onSurface,
                  //   ),
                  // ),
                ],
              ),
            );
          },
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        collapseMode: CollapseMode.parallax,
        background: _buildExpandedHeaderContent(),
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(48), // or adjust as needed
        child: Container(
          color: Styles.scaffoldBackground, // background color for tab bar
          child: TabBar(
            controller: widget.tabController,
            isScrollable: true,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            labelColor: Colors.black87,
            unselectedLabelColor: Colors.grey,
            indicatorColor: Colors.black87,
            indicatorWeight: 2,
            dividerColor: Colors.transparent,
            tabAlignment: TabAlignment.start,
            labelStyle: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
            unselectedLabelStyle: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.normal,
            ),
            tabs: const [
              Tab(text: 'Home'),
              Tab(text: 'Collection'),
              Tab(text: 'Membership'),
              Tab(text: 'About'),
            ],
          ),
        ),
      ),
    );
  }

  void _showImagePickerOptions({required bool isCover}) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _buildImagePickerSheet(isCover),
    );
  }

  void _showHeadlineDialog() {
    final controller = TextEditingController(text: headline == 'Add headline' ? '' : headline);

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          final currentLength = controller.text.length;
          final isOverLimit = currentLength > 80;

          return Dialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Edit Headline', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: controller,
                    maxLength: 80,
                    onChanged: (text) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: 'Enter your headline',
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      counterText: '$currentLength/80',
                      errorText: isOverLimit ? 'Headline cannot exceed 80 characters' : null,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: isOverLimit
                            ? null
                            : () async {
                                final newHeadline = controller.text.trim();
                                Navigator.pop(context);
                                if (newHeadline.isNotEmpty) {
                                  await _updateHeadline(newHeadline);
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: themeData.primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Save'),
                      ),
                    ],
                  )
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // void _showMoreOptions() {
  //   showModalBottomSheet(
  //     context: context,
  //     shape: const RoundedRectangleBorder(
  //         borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
  //     builder: (context) => Container(
  //       padding: const EdgeInsets.all(20),
  //       child: Column(
  //         mainAxisSize: MainAxisSize.min,
  //         children: [
  //           ListTile(
  //             leading: const Icon(Icons.settings),
  //             title: const Text('Settings'),
  //             onTap: () => Navigator.pop(context),
  //           ),
  //           ListTile(
  //             leading: const Icon(Icons.analytics),
  //             title: const Text('Analytics'),
  //             onTap: () => Navigator.pop(context),
  //           ),
  //           ListTile(
  //             leading: const Icon(Icons.help),
  //             title: const Text('Help'),
  //             onTap: () => Navigator.pop(context),
  //           ),
  //         ],
  //       ),
  //     ),
  //   );
  // }

  void _showErrorSnackBar(String message) {
    MyToast.showError(
      context: context,
      msg: message,
    );
  }

  void _showSuccessSnackBar(String message) {
    MyToast.showSuccess(
      context: context,
      msg: message,
    );
  }

  void _shareProfile() {
    final String creatorUrl = AppConfig.creatorShareUrl(creatorUsername);
    final shareText = 'Check Out This Creator: $creatorUrl';

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.grey[100],
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Share Profile',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ).withEpilogue,
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 20,
                runSpacing: 20,
                alignment: WrapAlignment.center,
                children: [
                  // Twitter
                  _buildSharingAppButton(
                    icon: FontAwesomeIcons.xTwitter,
                    label: 'Twitter',
                    shareUrl: '${AppConfig.twitterShareBase}?text=${Uri.encodeComponent(shareText)}',
                  ),

                  // Facebook
                  _buildSharingAppButton(
                    icon: FontAwesomeIcons.facebookF,
                    label: 'Facebook',
                    shareUrl: '${AppConfig.facebookShareBase}?u=${Uri.encodeComponent(creatorUrl)}',
                  ),

                  // WhatsApp
                  _buildSharingAppButton(
                    icon: FontAwesomeIcons.whatsapp,
                    label: 'WhatsApp',
                    shareUrl: '${AppConfig.whatsappShareBase}/?text=${Uri.encodeComponent(shareText)}',
                  ),

                  // Instagram
                  _buildSimpleAppButton(
                    icon: FontAwesomeIcons.instagram,
                    label: 'Instagram',
                    appScheme: 'instagram://',
                    webFallbackUrl: AppConfig.instagramFallback,
                  ),
                  _buildShareButton(
                    icon: Icons.share,
                    label: 'Share',
                    onTap: () async {
                      Navigator.pop(context);
                      await Share.share(shareText);
                    },
                  ),
                  _buildShareButton(
                    icon: Icons.link,
                    label: 'Link',
                    onTap: () async {
                      Navigator.pop(context);
                      await Clipboard.setData(ClipboardData(text: shareText));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Link copied to clipboard!')),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

// Helper for apps that support sharing via URL
  Widget _buildSharingAppButton({
    required IconData icon,
    required String label,
    required String shareUrl,
  }) {
    return _buildShareButton(
      icon: icon,
      label: label,
      onTap: () async {
        final uri = Uri.parse(shareUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not open $label')),
          );
        }
      },
    );
  }

// Helper for apps that can only be opened (like Instagram)
  Widget _buildSimpleAppButton({
    required IconData icon,
    required String label,
    required String appScheme,
    required String webFallbackUrl,
  }) {
    return _buildShareButton(
      icon: icon,
      label: label,
      onTap: () async {
        final appUri = Uri.parse(appScheme);
        final webUri = Uri.parse(webFallbackUrl);
        if (await canLaunchUrl(appUri)) {
          await launchUrl(appUri);
        } else if (await canLaunchUrl(webUri)) {
          await launchUrl(webUri, mode: LaunchMode.externalApplication);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not open $label')),
          );
        }
      },
    );
  }

  Widget _buildShareButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withValues(alpha: 0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Icon(icon, size: 24, color: Colors.black87),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.black87,
          ).withEpilogue,
        ),
      ],
    );
  }

  IconData _getPlatformIcon(String platform) {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return FontAwesomeIcons.xTwitter;
      case 'instagram':
        return FontAwesomeIcons.instagram;
      case 'tiktok':
        return FontAwesomeIcons.tiktok;
      case 'youtube':
        return FontAwesomeIcons.youtube;
      case 'twitch':
        return FontAwesomeIcons.twitch;
      case 'website':
        return FontAwesomeIcons.globe;
      default:
        return Icons.link;
    }
  }

  Widget _buildSocialIcons() {
    if (socialLinks.isEmpty) return const SizedBox.shrink();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        ...socialLinks.where((link) => link.url.isNotEmpty).map((link) {
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => _launchUrl(link.url),
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: Icon(
                  _getPlatformIcon(link.platform),
                  size: 16,
                  color: Colors.grey[700],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildExpandedHeaderContent() {
    return Column(
      children: [
        GestureDetector(
          onTap: () => _showImagePickerOptions(isCover: true),
          child: Container(
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(color: Colors.grey[200]),
            child: coverImageUrl.isNotEmpty
                ? CommonCachedNetworkImage(
                    imageUrl: coverImageUrl,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: 180,
                  )
                : Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.camera_alt, color: Colors.white, size: 16),
                          SizedBox(width: 4),
                          Text(
                            'Set Cover',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
          ),
        ),
        Container(
          color: Styles.scaffoldBackground,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              Transform.translate(
                offset: const Offset(0, -30),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    GestureDetector(
                      onTap: () => _showImagePickerOptions(isCover: false),
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.1),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: profileImageUrl.isEmpty
                            ? const Icon(Icons.person, size: 40, color: Colors.grey)
                            : CommonCachedNetworkImage(
                                imageUrl: profileImageUrl,
                                fit: BoxFit.cover,
                                borderRadius: 12,
                              ),
                      ),
                    ),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        ElevatedButton.icon(
                          onPressed: () {
                            context.pushNamed(Routes.createPostMain);
                          },
                          icon: Image.asset(
                            AppAssets.addIcon,
                            height: 14,
                            width: 14,
                            color: themeData.colorScheme.onPrimary,
                          ),
                          label: Text(
                            'Create',
                            style: themeData.textTheme.labelMedium
                                ?.copyWith(color: themeData.colorScheme.onPrimary, fontSize: 10, fontWeight: FontWeight.bold)
                                .withEpilogue,
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: themeData.primaryColor,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 8,
                            ),
                            minimumSize: const Size(60, 28),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        IconButton(
                          padding: EdgeInsets.zero,
                          onPressed: _shareProfile,
                          icon: Image.asset(
                            AppAssets.shareIcon,
                            height: 18,
                            width: 18,
                            color: themeData.colorScheme.onSurface,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: Colors.grey[300],
                            foregroundColor: Colors.grey[700],
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 8,
                            ),
                            minimumSize: const Size(20, 20),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8), // Square shape
                            ),
                          ),
                        ),
                        /* IconButton(
                          onPressed: _showMoreOptions,
                          icon: Image.asset(
                            AppAssets.more_icon,
                            height: 18,
                            width: 18,
                            color: themeData.colorScheme.onSurface,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: Colors.grey[300],
                            foregroundColor: Colors.grey[700],
                            elevation: 0,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 8,
                            ),
                            minimumSize: const Size(20, 20),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8), // Square shape
                            ),
                          ),
                        ),*/
                      ],
                    ),
                  ],
                ),
              ),
              Transform.translate(
                offset: const Offset(0, -20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          creatorDisplayName,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ).withEpilogue,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          ' Creator',
                          style: themeData.textTheme.labelSmall
                              ?.copyWith(
                                fontSize: 10,
                                color: themeData.colorScheme.onSurface.withValues(alpha: 0.6),
                              )
                              .withEpilogue,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Wrap(
                      children: [
                        GestureDetector(
                          onTap: _showHeadlineDialog,
                          child: Row(
                            children: [
                              Flexible(
                                child: Text(
                                  headline,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ).withEpilogue,
                                  overflow: TextOverflow.visible,
                                  softWrap: true,
                                  maxLines: 2,
                                ),
                              ),
                              const SizedBox(width: 15),
                              Image.asset(
                                AppAssets.editIcon,
                                height: 15,
                                width: 15,
                                color: themeData.colorScheme.onSurface.withValues(alpha: 0.6),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onLongPress: () {
                        // Copies the URL to the clipboard
                        Clipboard.setData(ClipboardData(text: "https://$websiteUrl"));

                        // Shows a confirmation message to the user
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Website URL copied to clipboard!'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        // To make the tap area fit the content
                        children: [
                          const Icon(Icons.link, size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            websiteUrl,
                            style: TextStyle(
                              fontSize: 14,
                              color: themeData.primaryColor,
                            ).withEpilogue,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        if (socialLinks.isNotEmpty) ...[
                          _buildSocialIcons(),
                          const SizedBox(width: 10),
                        ],
                        GestureDetector(
                          onTap: () {
                            showDialog(
                              context: context,
                              builder: (context) => EditSocialLinksDialog(
                                initialSocialLinks: socialLinks,
                                onSave: (links) {
                                  socialLinks = links;
                                  mySetState();
                                },
                              ),
                            );
                          },
                          child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              border: Border.all(color: themeData.primaryColor, width: 1.5),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Icon(
                              Icons.add,
                              size: 16,
                              color: themeData.primaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildImagePickerSheet(bool isCover) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            isCover ? 'Select Cover Image' : 'Select Profile Image',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          ListTile(
            leading: const Icon(Icons.photo_library),
            title: const Text('Choose from Gallery'),
            onTap: () {
              Navigator.pop(context);
              _pickImage(ImageSource.gallery, isCover: isCover);
            },
          ),
          ListTile(
            leading: const Icon(Icons.camera_alt),
            title: const Text('Take Photo'),
            onTap: () {
              Navigator.pop(context);
              _pickImage(ImageSource.camera, isCover: isCover);
            },
          ),
          if ((isCover && coverImageFile != null) || (!isCover && profileImageFile != null))
            ListTile(
              leading: const Icon(Icons.delete, color: Colors.red),
              title: const Text('Remove Image', style: TextStyle(color: Colors.red)),
              onTap: () {
                Navigator.pop(context);
                _removeImage(isCover: isCover);
              },
            ),
          const SizedBox(height: 10),
          Text(
            'Accepted formats: JPG, JPEG, PNG\nMax size: 5MB',
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
