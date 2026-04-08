import CommunityPage from "@/page-components/profile/community-page";
import React from "react";

const ChatPage: React.FC = () => {
  return (
    <>
      <CommunityPage page="direct-messages" mode="user" />
    </>
  );
};

export default ChatPage;
