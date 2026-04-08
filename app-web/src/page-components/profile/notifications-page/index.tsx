"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Spinner,
  Center,
  Heading,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import FilterPopover from "./filter-popover";
import NotificationsList from "./notifications-list";
import { useNotifications } from "@/context/notifications.provider";

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAllNotificationsAsRead,
    refetchNotifications,
  } = useNotifications();

  useEffect(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  return (
    <Box pt={"56px"} maxW={"648px"} w={"90vw"} mx={"auto"}>
      <Flex justifyContent={"space-between"} alignItems={"center"} mb={4}>
        <Heading fontSize={"xl"} fontWeight={600}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Heading>
        <Flex gap={3}>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsAsRead}
            >
              Mark all as read
            </Button>
          )}
          <FilterPopover />
        </Flex>
      </Flex>

      {isLoading && notifications.length === 0 ? (
        <Center py={10}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : error ? (
        <Center py={10}>
          <Text color="red.500">Error loading notifications</Text>
        </Center>
      ) : notifications.length === 0 ? (
        <Center py={10} flexDirection="column" gap={4}>
          <Text color="gray.500" fontSize="lg">
            No notifications yet
          </Text>
          <Text color="gray.400">
            {"When you get notifications, they'll appear here"}
          </Text>
        </Center>
      ) : (
        <NotificationsList />
      )}
    </Box>
  );
};

export default NotificationsPage;
