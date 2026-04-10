import { Avatar } from "@/components/ui/avatar";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { Box, Flex, Image, Stack, Text } from "@chakra-ui/react";
import React from "react";
import {
  NotificationResponseDto,
  NotificationType,
} from "@/typings/INotification";
import { useRouter } from "next/navigation";
import { useUserNotifications } from "@/context/user-notifications.provider";

interface Props {
  notification: NotificationResponseDto;
}

const NotificationItem: React.FC<Props> = ({ notification }) => {
  const { markNotificationAsRead } = useUserNotifications();
  const router = useRouter();

  const renderNotificationContent = () => {
    const actor = notification.actor?.name || "Someone";

    switch (notification.type) {
      case NotificationType.LIKE:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            liked your post:{" "}
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{notification.post?.title}</strong>
          </Text>
        );
      case NotificationType.COMMENT:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            commented on your post:{" "}
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{notification.post?.title}</strong>
          </Text>
        );
      case NotificationType.COMMENT_REPLY:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            replied to your comment on:{" "}
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{notification.post?.title}</strong>
          </Text>
        );
      case NotificationType.NEW_MEMBER:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            became a new member.
          </Text>
        );
      case NotificationType.UPGRADE:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            upgraded their membership.
          </Text>
        );
      case NotificationType.DOWNGRADE:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            downgraded their membership.
          </Text>
        );
      case NotificationType.CANCELLATION:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            cancelled their membership.
          </Text>
        );
      case NotificationType.NEW_POST:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            published a new post:{" "}
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{notification.post?.title}</strong>
          </Text>
        );
      case NotificationType.GROUP_CHAT_CREATED:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            created a new group chat.
          </Text>
        );
      case NotificationType.DIRECT_CHAT_CREATED:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            started a conversation with you.
          </Text>
        );
      case NotificationType.CHAT_MESSAGE:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            New message in your group chat from{" "}
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>.
          </Text>
        );
      case NotificationType.DIRECT_MESSAGE:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            sent you a new message.
          </Text>
        );
      default:
        return (
          <Text fontSize={"14px"} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            <strong style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{actor}</strong>{" "}
            sent you a notification.
          </Text>
        );
    }
  };

  return (
    <Flex
      my={2}
      gap={4}
      className={notification.isRead ? "" : "glass-card"}
      borderRadius={"12px"}
      px={"24px"}
      py={"16px"}
      justifyContent={"start"}
      position="relative"
      cursor={notification.link ? "pointer" : "auto"}
      css={
        notification.isRead
          ? {
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.5)",
              transition: "all 0.15s ease",
            }
          : {
              background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.06), hsl(335, 27%, 64% / 0.04))",
              border: "1px solid hsl(211, 71%, 43% / 0.15)",
              boxShadow: "0 2px 8px hsl(211, 71%, 43% / 0.08)",
            }
      }
      onClick={() => {
        markNotificationAsRead(notification.id);
        if (notification.link) {
          router.push(notification.link);
        }
      }}
      _hover={{
        transform: "translateY(-1px)",
        boxShadow: "0 4px 12px hsl(211, 71%, 43% / 0.1)",
      }}
      transition="all 0.15s ease"
    >
      <Avatar
        src={notification.actor?.profilePicture}
        name={notification.actor?.name}
      />
      <Stack flex={1}>
        {renderNotificationContent()}
        <Text textAlign={"start"} fontSize={"12px"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          {getTimeAgo(notification.createdAt)}
        </Text>
        {notification.comment && (
          <Box
            mt={2}
            p={3}
            borderRadius="8px"
            css={{
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Text fontSize="12px" fontStyle="italic" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              {notification.comment.content}
            </Text>
          </Box>
        )}
      </Stack>
      {notification.post?.thumbnailUrl && (
        <Box ml={"auto"} flexShrink={0}>
          <Image
            h={"50px"}
            w={"50px"}
            alt="thumbnail"
            borderRadius={"8px"}
            src={notification.post.thumbnailUrl}
            objectFit="cover"
          />
        </Box>
      )}
    </Flex>
  );
};

export default NotificationItem;
