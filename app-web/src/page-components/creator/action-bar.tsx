import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import ProfilePicture from "./profile-picture";
import SharePage from "./share-page";
import ActionBarMenu from "./action-bar-menu";
import { Button } from "@/components/ui/button";
import { Creator } from "@/lib/backend-services/creator-service";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/chat.provider";
import { toaster } from "@/components/ui/toaster";

const ActionBar: React.FC<{ creator: Creator; isMember: boolean }> = ({
  creator,
  isMember,
}) => {
  const router = useRouter();
  const { createDirectChat } = useChat();

  const handleMessageClick = async () => {
    console.log(`Initiating direct chat with creator ID: ${creator._id}`);
    try {
      const chat = await createDirectChat(creator._id, creator._id);

      if (chat && chat.id) {
        console.log(`Direct chat created/found. ID: ${chat.id}. Navigating...`);
        router.push(`/user/messages/direct-messages/${chat.id}`);
      } else {
        console.error("Failed to get chat details after creation.");
        toaster.create({
          title: "Error starting chat",
          description: "Could not retrieve chat details. Please try again.",
          type: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error initiating direct message:", error);
      toaster.create({
        title: "Error starting chat",
        description:
          "Could not start a direct message. Please try again later.",
        type: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box position={"relative"}>
      <ProfilePicture
        username={creator.displayName}
        profilePicture={creator.profilePicture}
      />
      <Flex
        gap={"8px"}
        pt={"24px"}
        px={"24px"}
        justifyContent={"end"}
        alignItems={"end"}
      >
        {isMember && <Button onClick={handleMessageClick}>Message</Button>}
        <SharePage username={creator.creatorUsername} />
        <ActionBarMenu creatorId={creator._id} />
        {/* <ActionBarPopover /> */}
      </Flex>
    </Box>
  );
};

export default ActionBar;
