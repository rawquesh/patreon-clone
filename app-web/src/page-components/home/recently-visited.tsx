import React from "react";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { ChevronRightIcon } from "@chakra-ui/icons";
import Scroller from "@/components/ui/scroller";
import SectionSkeleton from "@/components/ui/section-skeleton";
import { useRecentlyVisitedCreators } from "@/lib/backend-services/home-service";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

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
      minWidth="240px"
      borderRadius="md"
      p={3}
      _hover={{ bg: "gray.50" }}
      transition="all 0.2s"
      cursor="pointer"
      flexShrink={0}
      onClick={() => (window.location.href = `/creator/${username}`)}
    >
      <Flex direction="column" align="center">
        <Box
          position="relative"
          width="70px"
          height="70px"
          borderRadius="full"
          overflow="hidden"
          mb={3}
        >
          <Image
            src={image || "/placeholder-avatar.png"}
            alt={name}
            fill
            style={{ objectFit: "cover" }}
          />
        </Box>
        <Text
          fontWeight="bold"
          textAlign="center"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          width="100%"
        >
          {name}
        </Text>
        <Text fontSize="sm" color="gray.500" textAlign="center">
          {formatDistanceToNow(new Date(lastVisited), { addSuffix: true })}
        </Text>
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
      <Heading as="h2" size="md">
        Recently visited
      </Heading>
      <Link as={NextLink} href="/explore" color="blue.500" fontSize="sm">
        <Flex align="center">
          See all
          <ChevronRightIcon ml={1} />
        </Flex>
      </Link>
    </Flex>
  );

  return (
    <Box width="100%">
      <Scroller
        titleComponent={titleComponent}
        containerProps={{
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
