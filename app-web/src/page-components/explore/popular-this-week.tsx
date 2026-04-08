import Scroller from "@/components/ui/scroller";
import { Flex, Heading } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import PopularCreatorCard from "./popular-creator-card";
import { usePopularThisWeek } from "@/lib/backend-services/home-service";
import SectionSkeleton from "@/components/ui/section-skeleton";

const PopularThisWeek: React.FC = () => {
  const { data: popularCreators, isLoading, error } = usePopularThisWeek();

  if (isLoading) return <SectionSkeleton type="popular-this-week" />;
  if (error) return <div>Error loading popular creators</div>;
  if (!popularCreators || popularCreators.length === 0) return null;

  return (
    <Scroller
      containerProps={{
        display: "grid",
        alignItems: "stretch",
        position: "relative",
        width: "100%",
        overflow: "auto", // Equivalent to "scroll hidden"
        gap: { base: "12px", sm: "16px" },
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
        paddingTop: { base: "6px", sm: "8px" },
        paddingBottom: { base: "6px", sm: "8px" },
        marginTop: { base: "-6px", sm: "-8px" },
        marginBottom: { base: "-6px", sm: "-8px" },
        gridAutoFlow: "column",
        gridAutoColumns: {
          base: "max(300px, 97.561% - 0.292683px)",
          sm: "max(300px, 50% - 8px)",
          md: "max(300px, 33.3333% - 10.6667px)",
          lg: "max(300px, 33.3333% - 10.6667px)",
        },
        gridTemplateRows: "repeat(3, 1fr)",
      }}
      titleComponent={
        <>
          <Flex>
            <Heading
              transform={"translateY(-2px)"}
              fontSize={"xl"}
              fontWeight={600}
            >
              Popular this week
            </Heading>
            <Icon
              width={"24px"}
              icon={"material-symbols:chevron-right-rounded"}
            />
          </Flex>
        </>
      }
    >
      {popularCreators.map((creator) => (
        <PopularCreatorCard
          key={creator._id}
          name={creator.displayName}
          description={creator.creatorHeadline || "No description available"}
          image={creator.profilePicture || "/default-image.jpg"}
          href={`/creator/${creator.creatorUsername}`}
        />
      ))}
    </Scroller>
  );
};

export default PopularThisWeek;
