import 'package:flutter/material.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/styles/font_manager.dart';

import 'package:patreon-clone/backend/messaging/direct_message_provider.dart';

class ChatListItem extends StatelessWidget {
  final ChatItem chat;
  final VoidCallback onTap;
  final String Function(DateTime) formatTime;

  const ChatListItem({
    super.key,
    required this.chat,
    required this.onTap,
    required this.formatTime,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        splashColor: const Color(0xFF4A90E2).withValues(alpha: 0.1),
        highlightColor: const Color(0xFF4A90E2).withValues(alpha: 0.05),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(26),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      offset: const Offset(0, 2),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: CommonCachedNetworkImage(
                  imageUrl: chat.otherUser.profilePicture,
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            chat.otherUser.displayName,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1A1A1A),
                              letterSpacing: -0.2,
                            ).withEpilogue,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (chat.lastMessage != null)
                          Text(
                            formatTime(chat.lastMessage!.createdAt),
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFF8E8E93),
                              fontWeight: FontWeight.w500,
                            ).withEpilogue,
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      chat.lastMessage?.content ?? 'Start a conversation',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF8E8E93),
                        fontWeight: FontWeight.w500,
                        height: 1.3,
                      ).withEpilogue,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
