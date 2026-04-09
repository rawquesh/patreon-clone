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
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.value);
          return (
            <Flex
              key={category.value}
              css={{
                background: isSelected
                  ? "var(--gradient-primary)"
                  : "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid",
                borderColor: isSelected
                  ? "transparent"
                  : "rgba(255,255,255,0.5)",
                color: isSelected ? "white" : "hsl(215.4, 16.3%, 46.9%)",
                px: "16px",
                py: "8px",
                borderRadius: "999px",
                minW: "auto",
                whiteSpace: "nowrap",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: isSelected ? 600 : 500,
                transition: "all 0.2s ease",
                flexShrink: 0,
                boxShadow: isSelected
                  ? "0 4px 12px hsl(211, 71%, 43% / 0.25)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
              }}
              as="button"
              _hover={{
                background: isSelected
                  ? "var(--gradient-primary)"
                  : "rgba(255,255,255,0.9)",
                color: isSelected ? "white" : "hsl(222.2, 47.4%, 11.2%)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
            >
              <Text>{category.label}</Text>
              {isSelected && (
                <Icon
                  icon="lets-icons:close-round-fill"
                  width="14px"
                  height="14px"
                  style={{ marginLeft: "6px" }}
                />
              )}
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};

export default CategoriesFilter;
