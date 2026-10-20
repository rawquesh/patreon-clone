import 'package:flutter/material.dart';
import 'package:patreon_clone/models/user/data_model/user_model.dart';
import 'package:patreon_clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon_clone/styles/font_manager.dart';

import 'package:patreon_clone/backend/messaging/direct_message_provider.dart';

class GroupChatDetailsScreen extends StatefulWidget {
  final ChatItem chat;

  const GroupChatDetailsScreen({super.key, required this.chat});

  @override
  State<GroupChatDetailsScreen> createState() => _GroupChatDetailsScreenState();
}

class _GroupChatDetailsScreenState extends State<GroupChatDetailsScreen> {
  @override
  Widget build(BuildContext context) {
    UserModel? getCreatorData() {
      return widget.chat.allParticipants.firstWhere((user) => user.userId == widget.chat.creator.userId);
    }

    List<UserModel> allParticipants() {
      List<UserModel> participants = [...widget.chat.allParticipants];
      participants.removeWhere((user) => user.userId == widget.chat.creator.userId);
      return participants;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Group Details',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ).withEpilogue,
        ),
        foregroundColor: Colors.black87,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, color: Colors.black87, size: 28),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Center(
            child: CircleAvatar(
              radius: 40,
              backgroundColor: Colors.grey[200],
              child: Icon(
                Icons.group,
                size: 40,
                color: Colors.grey[600],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: Text(
              widget.chat.chat.title,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ).withEpilogue,
            ),
          ),
          const SizedBox(height: 24),
          if (getCreatorData() != null) ...[
            Text(
              'Creator',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.grey[700],
              ).withEpilogue,
            ),
            const SizedBox(height: 12),
            ListTile(
              leading: CircleAvatar(
                radius: 20,
                backgroundColor: Colors.grey[200],
                backgroundImage: NetworkImage(getCreatorData()!.profilePicture),
              ),
              title: Text(
                getCreatorData()!.displayName,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ).withEpilogue,
              ),
            ),
            const SizedBox(height: 24),
          ],
          Text(
            'Participants (${allParticipants().length})',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ).withEpilogue,
          ),
          const SizedBox(height: 12),
          ...allParticipants().map((participant) {
            return ListTile(
              leading: CommonCachedNetworkImage(
                imageUrl: participant.profilePicture,
                height: 40,
                width: 40,
                fit: BoxFit.cover,
                borderRadius: 20,
              ),
              title: Text(
                participant.displayName,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ).withEpilogue,
              ),
            );
          }),
        ],
      ),
    );
  }
}
