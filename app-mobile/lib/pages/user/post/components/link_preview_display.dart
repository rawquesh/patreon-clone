import 'package:any_link_preview/any_link_preview.dart';
import 'package:flutter/material.dart';
import 'package:patreon_clone/styles/font_manager.dart';

class LinkPreviewDisplay extends StatelessWidget {
  const LinkPreviewDisplay({
    super.key,
    required String? linkUrl,
  }) : _linkUrl = linkUrl;

  final String? _linkUrl;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Text(
        //   'Link Preview',
        //   style: const TextStyle(
        //     fontSize: 14,
        //     fontWeight: FontWeight.w600,
        //   ).withEpilogue,
        // ),
        // const SizedBox(height: 12),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: AnyLinkPreview(
            link: _linkUrl!,
            displayDirection: UIDirection.uiDirectionVertical,
            showMultimedia: true,
            bodyMaxLines: 3,
            bodyTextOverflow: TextOverflow.ellipsis,
            titleStyle: const TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.bold,
              fontSize: 15,
            ).withEpilogue,
            bodyStyle: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
            ).withEpilogue,
            errorBody: 'Could not load link preview',
            errorTitle: 'Error',
            errorWidget: Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.link_off,
                      size: 32,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Could not load link preview',
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: 12,
                      ).withEpilogue,
                    ),
                  ],
                ),
              ),
            ),
            cache: const Duration(hours: 1),
            backgroundColor: Colors.grey[50],
            borderRadius: 8,
            removeElevation: true,
          ),
        ),
      ],
    );
  }
}
