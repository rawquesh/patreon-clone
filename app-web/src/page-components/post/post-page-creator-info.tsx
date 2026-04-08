import { Avatar } from "@/components/ui/avatar";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSubscription } from "@/context/subscription.provider";
import { TierAccess } from "@/typings/ITierAccess";
import { UpgradeModal } from "@/components/upgrade-modal";

interface Props {
  avatarUrl: string;
  username: string;
  description: string;
  id: string;
  tierAccess: TierAccess[];
  // membership: string;
}

const PostPageCreatorInfo: React.FC<Props> = (props) => {
  return (
    <div>
      <Mobile {...props} />
      <Desktop {...props} />
    </div>
  );
};

const Mobile: React.FC<Props> = ({ avatarUrl, username }) => {
  return (
    <Flex gap={4} display={{ base: "flex", lg: "none" }} alignItems={"center"}>
      <Avatar w={"40px"} h={"40px"} shape={"rounded"} src={avatarUrl} />
      <Text fontWeight={600} fontSize={"2xl"}>
        {username}
      </Text>
    </Flex>
  );
};

const Desktop: React.FC<Props> = ({
  avatarUrl,
  // description,
  // membership,
  username,
  tierAccess,
  id,
}) => {
  const { subscriptions } = useSubscription();
  const isSubscribed = subscriptions.some(
    (subscription) =>
      subscription.creator._id === id && subscription.status === "active"
  );
  return (
    <Box
      borderRadius={"12px"}
      p={"16px"}
      display={{ base: "none", lg: "block" }}
      bg={"white"}
      w={"350px"}
    >
      <Stack alignItems={"center"} gap={0} textAlign={"center"}>
        <Avatar w={"120px"} h={"120px"} shape={"rounded"} src={avatarUrl} />
        <Text mt={2} fontWeight={600}>
          {username}
        </Text>
        {/* <Text fontSize={"sm"}>{description}</Text> */}
        {isSubscribed ? (
          <UpgradeModal tierAccess={tierAccess} />
        ) : (
          <Link href={`/creator/${username}#memberships`}>
            <Button mt={4} w="full">
              Become a member
            </Button>
          </Link>
        )}
      </Stack>
    </Box>
  );
};

export default PostPageCreatorInfo;
