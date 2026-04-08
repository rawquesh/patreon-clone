"use client";
import { Flex, Text } from "@chakra-ui/react";
import React, { Dispatch, SetStateAction } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { HARDCODED_CATEGORIES } from "@/lib/constants";

const categories = [
  { label: "All", value: "all" },
  ...HARDCODED_CATEGORIES.map((cat) => ({ label: cat.name, value: cat.name })),
];

interface CategoriesFilterProps {
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
  selectedCategories: string[];
  onCategoriesChange: Dispatch<SetStateAction<string[]>>;
}

const CategoriesFilter: React.FC<CategoriesFilterProps> = ({
  selectedCategories,
  onCategoriesChange,
}) => {
  return (
    <Flex
      position="relative"
      width="100%"
      overflowX="auto"
      mt={4}
      mb={6}
      pb={2}
      css={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Flex gap={3} px={1} width="max-content" minWidth="100%">
        {categories.map((category) => (
          <Flex
            key={category.value}
            bg={
              selectedCategories.includes(category.value)
                ? "gray.800"
                : "gray.100"
            }
            color={
              selectedCategories.includes(category.value) ? "white" : "gray.800"
            }
            px={4}
            py={2}
            rounded="full"
            minW="auto"
            whiteSpace="nowrap"
            cursor="pointer"
            as="button"
            _hover={{
              bg: selectedCategories.includes(category.value)
                ? "gray.700"
                : "gray.200",
            }}
            onClick={() =>
              onCategoriesChange((pre) => {
                if (pre.includes(category.value)) {
                  return pre.filter((c) => c !== category.value);
                }
                return [...pre, category.value];
              })
            }
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
            fontWeight={
              selectedCategories.includes(category.value) ? "medium" : "normal"
            }
            transition="all 0.2s"
            boxShadow={
              selectedCategories.includes(category.value) ? "sm" : "none"
            }
            flexShrink={0}
          >
            <Text>{category.label}</Text>
            {selectedCategories.includes(category.value) && (
              <Icon
                icon="lets-icons:close-round-fill"
                width="16px"
                height="16px"
                style={{ marginLeft: "6px" }}
              />
            )}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default CategoriesFilter;
