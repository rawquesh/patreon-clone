import { Avatar } from "@/components/ui/avatar";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { Box, Flex, Image, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  NotificationResponseDto,
  NotificationType,
} from "@/typings/INotification";
import { useNotifications } from "@/context/notifications.provider";

interface Props {
  notification: NotificationResponseDto;
}

const NotificationItem: React.FC<Props> = ({ notification }) => {
  const router = useRouter();
  const { markNotificationAsRead } = useNotifications();

  // const handleClick = () => {
  //   if (!notification.isRead) {
  //     markNotificationAsRead(notification.id);
  //   }

  //   // Navigate based on notification type
  //   if (notification.post) {
  //     router.push(`/post/${notification.post.id}`);
  //   }
  // };
  const renderNotificationContent = () => {
    const actor = notification.actor?.name || "Someone";

    switch (notification.type) {
      case NotificationType.LIKE:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> liked your post:{" "}
            <strong>{notification.post?.title}</strong>
          </Text>
        );
      case NotificationType.COMMENT:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> commented on your post:{" "}
            <strong>{notification.post?.title}</strong>
          </Text>
        );
      case NotificationType.COMMENT_REPLY:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> replied to your comment on:{" "}
            <strong>{notification.post?.title}</strong>
          </Text>
        );
      case NotificationType.NEW_MEMBER:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> became a new member.
          </Text>
        );
      case NotificationType.UPGRADE:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> upgraded their membership.
          </Text>
        );
      case NotificationType.DOWNGRADE:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> downgraded their membership.
          </Text>
        );
      case NotificationType.CANCELLATION:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> cancelled their membership.
          </Text>
        );
      case NotificationType.NEW_POST:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> published a new post:{" "}
            <strong>{notification.post?.title}</strong>
          </Text>
        );
      case NotificationType.GROUP_CHAT_CREATED:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> created a new group chat.
          </Text>
        );
      case NotificationType.DIRECT_CHAT_CREATED:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> started a conversation with you.
          </Text>
        );
      case NotificationType.CHAT_MESSAGE:
        return (
          <Text fontSize={"sm"}>
            New message in your group chat from <strong>{actor}</strong>.
          </Text>
        );
      case NotificationType.DIRECT_MESSAGE:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> sent you a new message.
          </Text>
        );
      default:
        return (
          <Text fontSize={"sm"}>
            <strong>{actor}</strong> sent you a notification.
          </Text>
        );
    }
  };

  return (
    <Flex
      my={2}
      gap={4}
      bg={notification.isRead ? "white" : "blue.50"}
      borderRadius={"12px"}
      px={"24px"}
      py={"16px"}
      justifyContent={"start"}
      // onClick={handleClick}
      // cursor="pointer"
      _hover={{ bg: notification.isRead ? "gray.50" : "blue.100" }}
      position="relative"
      cursor={notification.link ? "pointer" : "auto"}
      onClick={() => {
        markNotificationAsRead(notification.id);
        if (notification.link) {
          router.push(notification.link);
        }
      }}
    >
      <Avatar
        src={notification.actor?.profilePicture}
        name={notification.actor?.name}
      />
      <Stack flex={1}>
        {renderNotificationContent()}
        <Text textAlign={"start"} fontSize={"xs"}>
          {getTimeAgo(notification.createdAt)}
        </Text>
        {notification.comment && (
          <Box mt={2} p={2} bg="gray.50" borderRadius="md">
            <Text fontSize="xs" fontStyle="italic">
              {notification.comment.content}
            </Text>
          </Box>
        )}
      </Stack>
      {notification.post?.thumbnailUrl &&
        notification.post.thumbnailUrl !== "/default-thumbnail.png" && (
          <Box ml={"auto"}>
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
      {/* <Box position="absolute" top={2} right={2}>
				<MenuRoot>
					<MenuTrigger>
						<IconButton
							// onClick={(e) => e.stopPropagation()}
							variant="ghost"
							size="sm"
						>
							<Icon icon="solar:menu-dots-bold" />
						</IconButton>
					</MenuTrigger>
					<MenuContent>
						{!notification.isRead && (
							<MenuItem
								value={notification.id}
								onClick={(e) => {
									e.stopPropagation();
									markNotificationAsRead(notification.id);
								}}
							>
								Mark as read
							</MenuItem>
						)}
						<MenuItem
							value="remove"
							onClick={(e) => {
								e.stopPropagation();
								deleteUserNotification(notification.id);
							}}
						>
							Remove
						</MenuItem>
					</MenuContent>
				</MenuRoot>
			</Box> */}
    </Flex>
  );
};

export default NotificationItem;
