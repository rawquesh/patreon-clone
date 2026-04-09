import React from "react";
import { Box, Flex, Heading, Link, Text, Badge } from "@chakra-ui/react";
import NextLink from "next/link";
import { ChevronRightIcon } from "@chakra-ui/icons";
import Scroller from "@/components/ui/scroller";
import SectionSkeleton from "@/components/ui/section-skeleton";
import { useTopCreators } from "@/lib/backend-services/home-service";
import Image from "next/image";
import { CreatorCategory } from "@/lib/constants";

interface CreatorCardProps {
  name: string;
  username: string;
  image: string;
  headline: string;
  category?: CreatorCategory;
}

const getCategoryDisplayName = (category?: CreatorCategory) => {
  if (!category) return "";

  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const CreatorCard: React.FC<CreatorCardProps> = ({
  name,
  username,
  image,
  headline,
  category,
}) => {
  return (
    <Box
      minWidth="230px"
      borderRadius="md"
      border={"2px solid red"}
      overflow="hidden"
      boxShadow="sm"
      className="glass-card"
      flexShrink={0}
      onClick={() => (window.location.href = `/creator/${username}`)}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "md" }}
    >
      <Box position="relative" height="120px" width="100%">
        <Image
          src={image || "/placeholder-cover.png"}
          alt={name}
          fill
          style={{ objectFit: "cover" }}
        />
      </Box>
      <Box p={3}>
        <Flex justify="space-between" align="flex-start" mb={1}>
          <Text
            fontWeight="bold"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            width="70%"
          >
            {name}
          </Text>
          {category && (
            <Badge fontSize="xs" borderRadius="full" px={2} css={{ background: "var(--gradient-primary)", color: "white" }}>
              {getCategoryDisplayName(category)}
            </Badge>
          )}
        </Flex>
        <Text
          fontSize="sm"
          css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {headline}
        </Text>
      </Box>
    </Box>
  );
};

const TopCreators: React.FC = () => {
  const { data: topCreators, isLoading, isError } = useTopCreators();

  if (isLoading) {
    return <SectionSkeleton type="top-creators" />;
  }

  if (isError || !topCreators || topCreators.length === 0) {
    return null;
  }

  const titleComponent = (
    <Flex justify="space-between" align="center" width="100%">
      <Heading as="h2" size="md">
        Top creators
      </Heading>
      <Link as={NextLink} href="/explore" css={{ color: "hsl(211, 71%, 43%)" }} fontSize="sm">
        <Flex align="center">
          See all
          <ChevronRightIcon ml={1} />
        </Flex>
      </Link>
    </Flex>
  );

  return (
    <Box width="100%" mt={8}>
      <Scroller
        titleComponent={titleComponent}
        containerProps={{
          gap: 4,
          pb: 4,
        }}
      >
        {topCreators.map((creator) => (
          <CreatorCard
            key={creator._id}
            name={creator.displayName}
            username={creator.creatorUsername}
            image={creator.profilePicture}
            headline={creator.creatorHeadline}
            category={creator.creatorCategory}
          />
        ))}
      </Scroller>
    </Box>
  );
};

export default TopCreators;
