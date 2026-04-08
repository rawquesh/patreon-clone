import CommunityPage from "@/page-components/profile/community-page";
import { Box } from "@chakra-ui/react";
import React from "react";

const ChatPage: React.FC = () => {
  return (
    <Box>
      <CommunityPage page="chat" mode="user" />
    </Box>
  );
};

export default ChatPage;
