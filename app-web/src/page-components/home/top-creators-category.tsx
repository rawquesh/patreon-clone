import React from "react";
import { Box, Flex, Heading, Link, Text, Badge } from "@chakra-ui/react";
import NextLink from "next/link";
import { ChevronRightIcon } from "@chakra-ui/icons";
import Scroller from "@/components/ui/scroller";
import { branding } from "@/config/branding";
import SectionSkeleton from "@/components/ui/section-skeleton";
import {
  useTopCreatorsByCategory,
  useCategories,
} from "@/lib/backend-services/home-service";
import Image from "next/image";
// import CreatorCard from "@/components/creator/card";
// import SectionTitle from "@/components/home/section-title";
// import { homeAPI } from "@/lib/backend-services/home-service";
// import { CreatorCategory, HARDCODED_CATEGORIES } from "@/lib/constants";
import { CreatorCategory } from "@/lib/constants";
// import { Container, Grid } from "@chakra-ui/react";

interface CreatorCardProps {
  name: string;
  username: string;
  image: string;
  headline: string;
  category?: CreatorCategory;
}

const getCategoryDisplayName = (category?: CreatorCategory | string) => {
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

const TopCreatorsCategory: React.FC = () => {
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");

  React.useEffect(() => {
    if (categories.length > 0 && categories[0]?.name && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory, categoriesLoading]);

  const {
    data: categoryCreators,
    isLoading: creatorsLoading,
    isError,
  } = useTopCreatorsByCategory(selectedCategory);

  const isLoading = categoriesLoading || creatorsLoading;

  if (isLoading && !categoryCreators) {
    return <SectionSkeleton type="category" />;
  }

  if (isError || !categoryCreators || categoryCreators.length === 0) {
    return null;
  }

  const handleCategoryChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setSelectedCategory((e.target as HTMLSelectElement).value);
  };

  const titleComponent = (
    <Flex justify="space-between" align="center" width="100%">
      <Flex align="center" gap={4}>
        <Heading as="h2" size="md">
          Top in
        </Heading>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: `1px solid ${branding.colors.border}`,
            backgroundColor: "white",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            marginLeft: "16px",
            minWidth: "180px",
          }}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {getCategoryDisplayName(category.name)}
            </option>
          ))}
        </select>
      </Flex>
      <Link
        as={NextLink}
        href={`/explore?category=${selectedCategory}`}
        css={{ color: "hsl(211, 71%, 43%)" }}
        fontSize="sm"
      >
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
        {categoryCreators.map((creator) => (
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

export default TopCreatorsCategory;
