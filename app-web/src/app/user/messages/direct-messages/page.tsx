import CommunityPage from "@/page-components/profile/community-page";
import React from "react";

const DirectMessages: React.FC = () => {
	return (
		<>
			<CommunityPage page="direct-messages" mode="creator" />
		</>
	);
};

export default DirectMessages;
