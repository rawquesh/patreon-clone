import React from "react";
import { Box, Flex, Skeleton, Stack } from "@chakra-ui/react";

interface SectionSkeletonProps {
  type: "recently-visited" | "top-creators" | "popular-this-week" | "category";
}

const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ type }) => {
  return (
    <Box width="100%">
      <Skeleton height="24px" width="180px" mb={4} />

      <Flex gap={4} overflowX="hidden">
        {Array.from({ length: 5 }).map((_, i) => {
          if (type === "recently-visited") {
            return (
              <Box key={i} minWidth="240px" borderRadius="md" overflow="hidden">
                <Skeleton
                  height="60px"
                  width="60px"
                  borderRadius="full"
                  mb={3}
                />
                <Skeleton height="20px" width="80%" mb={2} />
                <Skeleton height="16px" width="60%" />
              </Box>
            );
          }

          if (type === "top-creators") {
            return (
              <Box key={i} minWidth="230px" borderRadius="md" overflow="hidden">
                <Skeleton height="120px" mb={3} />
                <Skeleton height="20px" width="80%" mb={2} />
                <Skeleton height="16px" width="60%" />
              </Box>
            );
          }

          if (type === "popular-this-week") {
            return (
              <Box key={i} minWidth="300px" borderRadius="md" overflow="hidden">
                <Flex gap={3}>
                  <Skeleton height="50px" width="50px" borderRadius="full" />
                  <Stack flex={1}>
                    <Skeleton height="20px" width="80%" />
                    <Skeleton height="16px" width="60%" />
                  </Stack>
                </Flex>
              </Box>
            );
          }

          if (type === "category") {
            return (
              <Box key={i} minWidth="230px" borderRadius="md" overflow="hidden">
                <Skeleton height="120px" mb={3} />
                <Skeleton height="20px" width="80%" mb={2} />
                <Skeleton height="16px" width="60%" />
              </Box>
            );
          }

          return null;
        })}
      </Flex>
    </Box>
  );
};

export default SectionSkeleton;
