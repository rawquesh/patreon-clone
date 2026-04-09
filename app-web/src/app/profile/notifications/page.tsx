import { Box } from "@chakra-ui/react";
import NotificationsPage from "@/page-components/profile/notifications-page";
import React from "react";

const Notifications: React.FC = () => {
	return (
		<Box className="animate-fade-in-up">
			<NotificationsPage />
		</Box>
	);
};

export default Notifications;
