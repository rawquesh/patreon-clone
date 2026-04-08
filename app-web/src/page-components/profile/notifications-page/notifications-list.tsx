import { sortByRelativeDate } from "@/utils/sortByRelativeDate";
import { Stack, Text, Center } from "@chakra-ui/react";
import React from "react";
import NotificationItem from "./notification-item";
import { useNotifications } from "@/context/notifications.provider";
import { Button } from "@/components/ui/button";

const NotificationsList: React.FC = () => {
	const { notifications, isLoading, fetchMoreNotifications } =
		useNotifications();

	const notificationsSorted = sortByRelativeDate(notifications, "timeStamp");

	return (
		<Stack gap={12} my={8}>
			{notificationsSorted["today"]?.length > 0 && (
				<Stack>
					<Text fontSize="lg" fontWeight="bold">
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
					<Text fontSize="lg" fontWeight="bold">
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
				>
					Load more
				</Button>
			</Center>
		</Stack>
	);
};

export default NotificationsList;
