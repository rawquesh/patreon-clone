class NotificationTypes {
  // Post interactions
  static const String liked = "liked";
  static const String commented = "commented";
  static const String commentReply = "comment_reply";

  // Membership
  static const String newMember = "new_member";
  static const String downgrade = "downgrade";
  static const String cancellation = "cancellation";

  // Content
  static const String newPost = "new_post";

  // Chats
  static const String chatMessage = "chat_message"; // community/group
  static const String directMessage = "direct_message"; // DM
  static const String directChatCreated = "direct_chat_created"; // DM created
  static const String groupChatCreated = "group_chat_created";

  // Admin
  static const String adminContentNotice = "admin_content_notice";

  static List<String> get values => [
        liked,
        commented,
        commentReply,
        newMember,
        downgrade,
        cancellation,
        newPost,
        chatMessage,
        directMessage,
        directChatCreated,
        groupChatCreated,
        adminContentNotice,
      ];
}
