import React from "react";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import Scroller from "@/components/ui/scroller";
import SectionSkeleton from "@/components/ui/section-skeleton";
import { useRecentlyVisitedCreators } from "@/lib/backend-services/home-service";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface RecentlyVisitedCardProps {
  name: string;
  username: string;
  image: string;
  lastVisited: string;
}

const RecentlyVisitedCard: React.FC<RecentlyVisitedCardProps> = ({
  name,
  username,
  image,
  lastVisited,
}) => {
  return (
    <Box
      minWidth="200px"
      borderRadius="12px"
      p={3}
      className="glass-card"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(29, 112, 191, 0.12)",
      }}
      transition="all 0.2s ease"
      cursor="pointer"
      flexShrink={0}
      onClick={() => (window.location.href = `/creator/${username}`)}
    >
      <Flex direction="row" align="center">
        <Box
          position="relative"
          width="48px"
          height="48px"
          borderRadius="full"
          overflow="hidden"
          mr={3}
          flexShrink={0}
        >
          <Image
            src={image || "/placeholder-avatar.png"}
            alt={name}
            fill
            style={{ objectFit: "cover" }}
          />
        </Box>
        <Box>
          <Text
            fontWeight={600}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            width="100%"
            fontSize="sm"
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            {name}
          </Text>
          <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            {formatDistanceToNow(new Date(lastVisited), { addSuffix: true })}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

const RecentlyVisited: React.FC = () => {
  const {
    data: recentlyVisited,
    isLoading,
    isError,
  } = useRecentlyVisitedCreators();

  if (isLoading) {
    return <SectionSkeleton type="recently-visited" />;
  }

  if (isError || !recentlyVisited || recentlyVisited.length === 0) {
    return null;
  }

  const titleComponent = (
    <Flex justify="space-between" align="center" width="100%">
      <Heading
        as="h2"
        size="md"
        css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
      >
        Recently visited
      </Heading>
      <Link
        as={NextLink}
        href="/explore/creators?key=recently-visited"
        fontSize="sm"
        fontWeight={500}
        css={{
          color: "hsl(211, 71%, 43%)",
          "&:hover": { textDecoration: "underline" },
        }}
      />
    </Flex>
  );

  return (
    <Box width="100%">
      <Scroller
        titleComponent={titleComponent}
        containerProps={{
          display: "flex",
          overflowX: "auto",
          gap: 4,
          pb: 4,
        }}
      >
        {recentlyVisited.map((creator) => (
          <RecentlyVisitedCard
            key={creator._id}
            name={creator.displayName}
            username={creator.creatorUsername}
            image={creator.profilePicture}
            lastVisited={creator.lastVisitedAt}
          />
        ))}
      </Scroller>
    </Box>
  );
};

export default RecentlyVisited;
