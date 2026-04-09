import { sortByRelativeDate } from "@/utils/sortByRelativeDate";
import { Stack, Text, Center } from "@chakra-ui/react";
import React from "react";
import NotificationItem from "./notification-item";
import { useUserNotifications } from "@/context/user-notifications.provider";
import { Button } from "@/components/ui/button";

const NotificationsList: React.FC = () => {
  const { notifications, isLoading, fetchMoreNotifications } =
    useUserNotifications();

  const notificationsSorted = sortByRelativeDate(notifications, "timeStamp");

  return (
    <Stack gap={8} my={8}>
      {notificationsSorted["today"]?.length > 0 && (
        <Stack>
          <Text
            fontSize="md"
            fontWeight={700}
            css={{ color: "hsl(215.4, 16.3%, 46.9%)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "11px" }}
          >
            Today
          </Text>
          {notificationsSorted["today"].map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </Stack>
      )}

      {notificationsSorted["earlier"]?.length > 0 && (
        <Stack>
          <Text
            fontSize="md"
            fontWeight={700}
            css={{ color: "hsl(215.4, 16.3%, 46.9%)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "11px" }}
          >
            Earlier
          </Text>
          {notificationsSorted["earlier"].map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </Stack>
      )}

      <Center>
        <Button
          variant="outline"
          loading={isLoading}
          onClick={() => fetchMoreNotifications()}
          className="btn-gradient-ghost"
        >
          Load more
        </Button>
      </Center>
    </Stack>
  );
};

export default NotificationsList;
