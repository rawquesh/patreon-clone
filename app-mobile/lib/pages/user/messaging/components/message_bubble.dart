import 'dart:io';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:patreon-clone/models/message/attachment_data_model.dart';
import 'package:patreon-clone/models/message/message_data_model.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:patreon-clone/backend/messaging/direct_message_provider.dart';

// A reusable widget that displays text and makes URLs clickable.
class LinkText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final TextStyle? linkStyle;
  final bool isMe;

  const LinkText(
    this.text, {
    super.key,
    this.isMe = false,
    this.style,
    this.linkStyle,
  });

  // Regular expression to find URLs in a string.
  static final RegExp _urlRegex = RegExp(
    r"(?:(?:https|http):\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)",
    caseSensitive: false,
  );

  // Function to launch a URL.
  Future<void> _launchUrl(String url) async {
    // Add "https://" if the URL doesn't have a scheme.
    final String newUrl = !url.startsWith(RegExp(r'https?:\/\/')) ? 'https://$url' : url;

    if (await canLaunchUrl(Uri.parse(newUrl))) {
      await launchUrl(Uri.parse(newUrl));
    } else {
      // You could show a snackbar or dialog here.
      debugPrint('Could not launch $newUrl');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Use the default text style from the theme if no style is provided.
    final effectiveStyle = style ?? Theme.of(context).textTheme.bodyMedium;

    // Define the style for the links.
    // It will use the base style's color unless a specific linkStyle is provided.
    final effectiveLinkStyle =
        (linkStyle ?? effectiveStyle?.copyWith(color: isMe ? Colors.white : Theme.of(context).primaryColor))
            ?.copyWith(decoration: TextDecoration.underline);

    final List<TextSpan> spans = [];
    text.splitMapJoin(
      _urlRegex,
      onMatch: (Match match) {
        final url = match.group(0)!;
        spans.add(
          TextSpan(
            text: url,
            style: effectiveLinkStyle,
            recognizer: TapGestureRecognizer()..onTap = () => _launchUrl(url),
          ),
        );
        return '';
      },
      onNonMatch: (String nonMatch) {
        spans.add(TextSpan(text: nonMatch, style: effectiveStyle));
        return '';
      },
    );

    return RichText(
      text: TextSpan(children: spans),
    );
  }
}

class MessageBubble extends StatefulWidget {
  final MessageModel message;
  final bool isMe;
  final String Function(DateTime) formatTime;
  final ChatItem chat;

  const MessageBubble({
    super.key,
    required this.message,
    required this.isMe,
    required this.formatTime,
    required this.chat,
  });

  @override
  State<MessageBubble> createState() => _MessageBubbleState();
}

class _MessageBubbleState extends State<MessageBubble> with MySafeState {
  late UserModel _selfUserModel;

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    _selfUserModel = DependencyInjection.authenticationProvider.userModel.get() ?? UserModel();

    final hasAttachments = widget.message.attachments.isNotEmpty;
    final bubbleColor = hasAttachments ? Colors.white : (widget.isMe ? Theme.of(context).primaryColor : Colors.white);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: widget.isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          // Left avatar (other user)
          if (!widget.isMe) ...[
            _buildOtherUserAvatar(),
            const SizedBox(width: 8),
          ],

          // Bubble
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: bubbleColor,
                borderRadius: BorderRadius.circular(15).copyWith(
                  topLeft: Radius.circular(widget.isMe ? 10 : 0),
                  topRight: Radius.circular(widget.isMe ? 0 : 10),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 5,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // IMAGES (one or many)
                  if (hasAttachments) ..._buildImageAttachments(widget.message.attachments),

                  // TEXT (only if non-empty)
                  if (widget.message.content.trim().isNotEmpty) ...[
                    if (hasAttachments) const SizedBox(height: 8),
                    // *** MODIFICATION HERE ***
                    // Replaced Text widget with LinkText widget
                    LinkText(
                      widget.message.content,
                      isMe: widget.isMe,
                      style: TextStyle(
                        color: hasAttachments ? Colors.black : (widget.isMe ? Colors.white : Colors.black),
                        fontSize: 16,
                      ).withEpilogue,
                      // Customizing link style to be more visible on dark backgrounds
                      linkStyle: TextStyle(
                        color: widget.isMe ? Colors.yellowAccent : Theme.of(context).primaryColor,
                        fontSize: 16,
                      ).withEpilogue,
                    ),
                  ],

                  const SizedBox(height: 4),
                  Text(
                    widget.formatTime(widget.message.createdAt),
                    style: TextStyle(
                      color: hasAttachments ? Colors.grey : (widget.isMe ? Colors.white70 : Colors.grey),
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                    ).withEpilogue,
                  ),
                ],
              ),
            ),
          ),

          // Right avatar (self)
          if (widget.isMe) ...[
            const SizedBox(width: 8),
            _buildSelfAvatar(),
          ],
        ],
      ),
    );
  }

  // --- Avatars ---

  Widget _buildOtherUserAvatar() {
    final url = widget.chat.otherUser.profilePicture;
    if (url.isNotEmpty) {
      return CommonCachedNetworkImage(
        imageUrl: url,
        height: 30,
        width: 30,
        fit: BoxFit.cover,
        borderRadius: 20,
      );
    }
    return CircleAvatar(
      radius: 16,
      backgroundColor: Colors.grey[300],
      child: Text(
        _initials(widget.chat.otherUser.displayName),
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ).withEpilogue,
      ),
    );
  }

  Widget _buildSelfAvatar() {
    final url = _selfUserModel.profilePicture;
    if (url.isNotEmpty) {
      return CommonCachedNetworkImage(
        imageUrl: url,
        height: 30,
        width: 30,
        fit: BoxFit.cover,
        borderRadius: 20,
      );
    }
    return CircleAvatar(
      radius: 16,
      backgroundColor: Colors.grey[300],
      child: Text(
        _initials(_selfUserModel.displayName),
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ).withEpilogue,
      ),
    );
  }

  String _initials(String name) {
    if (name.isEmpty) return 'T';
    final t = name.trim();
    if (t.isEmpty) return 'T';
    return t.characters.first.toUpperCase();
  }

  // --- Attachments rendering ---

  List<Widget> _buildImageAttachments(Map<String, AttachmentModel> attachments) {
    final List<Widget> widgets = [];

    final images = attachments.values.where((a) {
      final map = a.toMap();
      final url = (map['url'] ?? '').toString().toLowerCase();
      final fileType = (map['fileType'] ?? '').toString().toLowerCase();
      final isImageByMime = fileType.startsWith('image/');
      final isImageByExt =
          url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.webp') || url.endsWith('.gif');
      return isImageByMime || isImageByExt || (!url.startsWith('http') && url.isNotEmpty);
    }).toList();

    for (final a in images) {
      final map = a.toMap();
      final url = (map['url'] ?? '').toString();

      widgets.add(
        ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: _buildImageByUrl(url),
        ),
      );
      widgets.add(const SizedBox(height: 6));
    }

    if (widgets.isNotEmpty) widgets.removeLast(); // trim last spacer
    return widgets;
  }

  Widget _buildImageByUrl(String url) {
    // Optimistic local preview path (file path)
    if (!url.startsWith('http')) {
      final f = File(url);
      if (f.existsSync()) {
        return Image.file(
          f,
          width: 220,
          fit: BoxFit.cover,
        );
      }
    }
    // Network image
    return CommonCachedNetworkImage(
      imageUrl: url,
      height: 220,
      width: 220,
      fit: BoxFit.cover,
      borderRadius: 0, // already clipped by parent
    );
  }
}
