import CreatorCard from "@/components/ui/creator-card";
import Scroller from "@/components/ui/scroller";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React from "react";
import { useTopCreators } from "@/lib/backend-services/home-service";
import SectionSkeleton from "@/components/ui/section-skeleton";

const TopCreators: React.FC = () => {
  const { data: topCreators, isLoading, error } = useTopCreators();

  if (isLoading) return <SectionSkeleton type="category" />;
  if (error) return <div>Error loading top creators</div>;
  if (!topCreators || topCreators.length === 0) return null;

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
          <Link href="/top-creators/ALL">
            <Flex alignItems={"center"}>
              <Heading
                transform={"translateY(-2px)"}
                fontSize={"xl"}
                fontWeight={600}
              >
                Top Creators
              </Heading>
              <Icon
                width={"24px"}
                icon={"material-symbols:chevron-right-rounded"}
              />
            </Flex>
          </Link>
        }
      >
        {topCreators.map((creator) => (
          <CreatorCard
            key={creator._id}
            image={creator.profilePicture || "/default-image.jpg"}
            name={creator.displayName}
            description={creator.creatorHeadline || "No description available"}
            href={`/creator/${creator.creatorUsername}`}
          />
        ))}
      </Scroller>
    </Box>
  );
};

export default TopCreators;
