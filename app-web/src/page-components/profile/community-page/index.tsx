"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import ChatMessages from "./chat-messages";
import DirectMessages from "./direct-messages";
import { useAuth } from "@/context/auth.provider";
import { Box } from "@chakra-ui/react";

const CommunityPage: React.FC<{
  page: "chat" | "direct-messages";
  mode?: "user" | "creator";
  chatId?: string;
}> = ({ page, mode: explicitMode, chatId }) => {
  const { user } = useAuth();
  const mode = explicitMode || (user?.isCreator ? "creator" : "user");

  return (
    <Box>
      <Sidebar page={page} mode={mode} />
      {page === "chat" ? (
        <ChatMessages mode={mode} chatId={chatId} />
      ) : (
        <DirectMessages />
      )}
    </Box>
  );
};

export default CommunityPage;
