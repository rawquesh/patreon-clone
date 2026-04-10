import React, { useState } from "react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { IconButton } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "@/context/auth.provider";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";
import api from "@/lib/api";
import { ApiEndpoints } from "@/lib/backend-services/api_endpoints";

const ActionBarMenu: React.FC<{ creatorId: string }> = ({ creatorId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const handleJoinForFree = async () => {
    if (!user) {
      router.push(`/auth/login`);
    } else {
      try {
        setIsLoading(true);
        await api.post(ApiEndpoints.membershipSubscribeFree(creatorId));
        toaster.create({
          title: "Success",
          description: "You have successfully joined the free membership",
          type: "success",
          duration: 3000,
        });
        window.location.reload();
      } catch (error) {
        console.error("Error subscribing to free membership:", error);
        toaster.create({
          title: "Error",
          description: "Failed to join the free membership. Please try again.",
          type: "error",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <MenuRoot>
      <MenuTrigger>
        <IconButton variant={"ghost"} as={"div"}>
          <Icon icon={"solar:menu-dots-bold"} />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem disabled={isLoading} onClick={handleJoinForFree} value="join">
          Join for free
        </MenuItem>
        {user && (
          <>
            <MenuItem value="block">Block this creator</MenuItem>
            <MenuItem value="report">Report this creator</MenuItem>
          </>
        )}
      </MenuContent>
    </MenuRoot>
  );
};

export default ActionBarMenu;
