import React from "react";
import ProfilePicture from "./profile-picture";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import CreateModal from "./create-modal";
// import ShareThisPage from "./share-this-page";
import ActionBarPopover from "./action-bar-popover";
import { useAuth } from "@/context/auth.provider";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toaster } from "@/components/ui/toaster";

interface Props {}

const ActionBar: React.FC<Props> = () => {
  const { user } = useAuth();
  const baseUrl = window.location.origin;

  const pageUrl = `${baseUrl}/creator/${user!.creatorUsername}`;

  return (
    <Box position={"relative"}>
      <ProfilePicture
        username={user!.firstName!}
        profilePicture={user?.profilePicture}
      />
      <Flex
        gap={"8px"}
        pt={"24px"}
        px={"24px"}
        justifyContent={"end"}
        alignItems={"end"}
      >
        <CreateModal />
        <IconButton
          // colorScheme={"blue"}
          // variant={"outline"}
          rounded={"8px"}
          color={"blue.50"}
          bg={"blue.600"}
          onClick={() => {
            navigator.clipboard.writeText(pageUrl).then(() => {
              toaster.create({
                title: "Link copied!",
                type: "success",
                duration: 2000,
              });
            });
          }}
        >
          <Icon icon={"icon-park-solid:copy-link"} />
        </IconButton>
        {/* <ShareThisPage /> */}
        <ActionBarPopover />
      </Flex>
    </Box>
  );
};

export default ActionBar;
