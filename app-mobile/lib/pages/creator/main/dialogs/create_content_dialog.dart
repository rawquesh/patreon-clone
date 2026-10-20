import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';
import 'package:patreon_clone/styles/font_manager.dart';

class CreateContentDialog extends StatelessWidget {
  const CreateContentDialog({super.key});

  @override
  Widget build(BuildContext context) {
    ThemeData themeData = Theme.of(context);
    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        constraints: const BoxConstraints(
          maxWidth: 400,
          minWidth: 300,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Select a type',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ).withEpilogue,
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close, size: 20),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Content type buttons grid
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 3,
              mainAxisSpacing: 24,
              crossAxisSpacing: 24,
              childAspectRatio: 1.0,
              children: [
                _buildContentTypeButton(
                  icon: CupertinoIcons.doc_text_fill,
                  label: 'Text',
                  onTap: () {
                    context.pushNamed(Routes.createTextPost);
                  },
                ),
                _buildContentTypeButton(
                  icon: CupertinoIcons.play_rectangle_fill,
                  label: 'Video',
                  onTap: () {
                    context.pushNamed(Routes.createVideoPost);
                  },
                ),
                _buildContentTypeButton(
                  icon: CupertinoIcons.mic_fill,
                  label: 'Audio',
                  onTap: () {
                    context.pushNamed(Routes.createAudioPost);
                  },
                ),
                _buildContentTypeButton(
                  icon: CupertinoIcons.photo_fill,
                  label: 'Image',
                  onTap: () {
                    context.pushNamed(Routes.createImagePost);
                  },
                ),
                _buildContentTypeButton(
                  icon: CupertinoIcons.link,
                  label: 'Link',
                  onTap: () {
                    context.pushNamed(Routes.createLinkPost);
                  },
                ),
              ],
            ),
            const SizedBox(height: 32),

            // View drafts button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _handleViewDrafts(context),
                icon: const Icon(
                  CupertinoIcons.archivebox,
                  size: 16,
                  color: Colors.white,
                ),
                label: Text(
                  'View drafts',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ).withEpilogue,
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: themeData.primaryColor,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContentTypeButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: Colors.grey.shade200,
            width: 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 32,
              color: Colors.grey.shade700,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Colors.grey.shade700,
              ).withEpilogue,
            ),
          ],
        ),
      ),
    );
  }

  // void _handleContentType(BuildContext context, String type) {}

  void _handleViewDrafts(BuildContext context) {}
}
