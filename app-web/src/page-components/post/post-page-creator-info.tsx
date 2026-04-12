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
      display={{ base: "none", lg: "block" }}
      className="glass-card"
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      border="1px solid"
      css={{
        borderColor: "rgba(255,255,255,0.8)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        backgroundImage: "var(--gradient-sidebar)",
      }}
    >
      {/* Accent top bar */}
      <Box
        h="3px"
        w="100%"
        css={{
          background: "var(--gradient-primary)",
        }}
      />

      <Stack
        alignItems={"center"}
        gap={4}
        textAlign={"center"}
        p={6}
      >
        <Avatar
          w={"100px"}
          h={"100px"}
          shape={"rounded"}
          src={avatarUrl}
        />
        <Box>
          <Text fontWeight={700} fontSize="lg" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            {username}
          </Text>
          <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            Content creator
          </Text>
        </Box>
        {isSubscribed ? (
          <UpgradeModal tierAccess={tierAccess} />
        ) : (
          <Link href={`/creator/${username}#memberships`} style={{ width: "100%" }}>
            <Button w="full">
              Become a member
            </Button>
          </Link>
        )}
      </Stack>
    </Box>
  );
};

export default PostPageCreatorInfo;
