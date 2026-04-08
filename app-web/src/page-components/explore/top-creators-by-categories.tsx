import React from "react";
import { Stack } from "@chakra-ui/react";
import { useCategories } from "@/lib/backend-services/home-service";
import TopCreatorsCategory from "./top-creators-category";
import SectionSkeleton from "@/components/ui/section-skeleton";

const TopCreatorsByCategories: React.FC<{
  selectedCategories: string[];
}> = ({ selectedCategories }) => {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) return <SectionSkeleton type="category" />;
  if (error) return null;
  if (!categories || categories.length === 0) return null;
  console.log({ categories });
  // Filter out the "all" category if it exists
  const filteredCategories =
    selectedCategories.length > 0
      ? categories.filter((c) => selectedCategories.includes(c.name))
      : categories;

  console.log({ filteredCategories });
  return (
    <Stack gap={8}>
      {filteredCategories.map((category) => (
        <TopCreatorsCategory
          key={category.name}
          id={category.id}
          category={category.name}
        />
      ))}
    </Stack>
  );
};

export default TopCreatorsByCategories;
