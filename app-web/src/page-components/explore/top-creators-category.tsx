import CreatorCard from "@/components/ui/creator-card";
import Scroller from "@/components/ui/scroller";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React from "react";
import { useTopCreatorsByCategory } from "@/lib/backend-services/home-service";
import SectionSkeleton from "@/components/ui/section-skeleton";

// Helper function to format category name for display
const formatCategoryName = (category: string) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const TopCreatorsCategory: React.FC<{ category: string; id: string }> = ({
  category,
  id,
}) => {
  const {
    data: categoryCreators,
    isLoading,
    error,
  } = useTopCreatorsByCategory(category);

  if (isLoading) return <SectionSkeleton type="top-creators" />;
  if (error) return null;
  if (!categoryCreators || categoryCreators.length === 0) return null;

  const displayCategory = formatCategoryName(category);

  return (
    <Box>
      <Scroller
        containerProps={{
          display: "grid",
          alignItems: "stretch",
          position: "relative",
          width: "100%",
          overflow: "auto",
          gap: { base: "16px" },
          paddingTop: { base: "6px", sm: "8px" },
          paddingBottom: { base: "6px", sm: "8px" },
          marginTop: { base: "-6px", sm: "-8px" },
          marginBottom: { base: "-6px", sm: "-8px" },
          paddingLeft: {
            base: "16px",
            sm: "40px",
            md: "8px",
            lg: "8px",
          },
          paddingRight: {
            base: "16px",
            sm: "40px",
            md: "8px",
            lg: "8px",
          },
          marginLeft: {
            base: "-16px",
            sm: "-40px",
            md: "-8px",
            lg: "-8px",
          },
          marginRight: {
            base: "-16px",
            sm: "-40px",
            md: "-8px",
            lg: "-8px",
          },
          gridAutoFlow: "column",
          gridAutoColumns: {
            base: "max(230px, 48.7805% - 6.14634px)",
            sm: "max(230px, 25% - 12px)",
            md: "max(230px, 20% - 12.8px)",
            lg: "max(230px, 16.6667% - 13.3333px)",
          },
          gridTemplateRows: "repeat(1, 1fr)",
        }}
        titleComponent={
          <Link href={`/top-creators/${id}`}>
            <Flex
              css={{
                "& svg": {
                  transform: "translateY(-3px)",
                },
              }}
              alignItems={"end"}
            >
              <Stack gap={0}>
                <Text fontSize={"sm"} color={"star.600"}>
                  Top creators in
                </Text>
                <Heading
                  transform={"translateY(-2px)"}
                  fontSize={"xl"}
                  fontWeight={600}
                >
                  {displayCategory}
                </Heading>
              </Stack>
              <Icon
                width={"24px"}
                icon={"material-symbols:chevron-right-rounded"}
              />
            </Flex>
          </Link>
        }
      >
        {categoryCreators.map((creator) => (
          <CreatorCard
            key={creator._id}
            description={creator.creatorHeadline || "No description available"}
            href={`/creator/${creator.creatorUsername}`}
            image={creator.profilePicture || "/default-image.jpg"}
            name={creator.displayName}
          />
        ))}
      </Scroller>
    </Box>
  );
};

export default TopCreatorsCategory;
