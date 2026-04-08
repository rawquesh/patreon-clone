import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { useNotifications } from "@/context/notifications.provider";

interface NotificationBadgeProps {
  children: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ children }) => {
  const { unreadCount } = useNotifications();

  return (
    <Box position="relative" display="inline-block">
      {children}
      {unreadCount > 0 && (
        <Box
          position="absolute"
          top="-7px"
          right="-7px"
          bg="blue.500"
          borderRadius="full"
          width="18px"
          height="18px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
          color="white"
          css={{
            "& #notification-text": {
              color: "white",
            },
          }}
        >
          <Text
            fontSize="xs"
            id="notification-text"
            fontWeight="bold"
            color="white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default NotificationBadge;
