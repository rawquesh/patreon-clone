import { Box, Flex, Grid, Heading, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import CreateCollectionModal from "./create-collection-modal";
import CollectionCard from "@/components/collection-card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface Collection {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  postCount: number;
}

const Collection: React.FC = () => {
  const queryClient = useQueryClient();

  const resetCollectionsCache = () => {
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  const handleCollectionCreated = (_id: string) => {
    console.log(_id);
    resetCollectionsCache();
  };

  const {
    data: collections,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await api.get<{ collections: Collection[] }>(
        "/collections"
      );
      return data.collections || [];
    },
  });

  const hasCollections = collections && collections.length > 0;

  return (
    <Box
      w={{ base: "90%", lg: "984px" }}
      borderRadius={"6px"}
      mx={"auto"}
      p={"24px"}
    >
      <Flex alignItems={"center"} justifyContent={"space-between"} mb={6}>
        <Heading fontSize={"xl"} fontWeight={600}>
          Collections
        </Heading>
        <CreateCollectionModal onSubmit={handleCollectionCreated} />
      </Flex>

      {isLoading ? (
        <Text textAlign="center">Loading collections...</Text>
      ) : error ? (
        <Text textAlign="center" css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
          Error loading collections
        </Text>
      ) : hasCollections ? (
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
        >
          {collections.map((collection) => (
            <CollectionCard
              key={collection._id}
              id={collection._id}
              title={collection.title}
              description={collection.description}
              imageUrl={collection.coverImage}
              postCount={collection.postCount}
            />
          ))}
        </Grid>
      ) : (
        <Stack textAlign={"center"} mt={6} alignItems={"center"}>
          <Box w={"fit"} css={{ background: "hsl(211, 71%, 43% / 0.1)" }} p={4} borderRadius={"999px"}>
            <Icon height={"36px"} style={{ color: "hsl(211, 71%, 43%)" }} icon={"solar:playlist-bold"} />
          </Box>
          <Text fontSize={"sm"} fontWeight={600}>
            No collections yet
          </Text>
          <Text maxW="400px" fontSize={"sm"}>
            Collections is an improved way to organize your posts and it helps
            your members explore all your great work.
          </Text>
          {/* <ButtonWithIcon
						mt={4}
						onClick={() => {
							const createButton = document.querySelector(
								'[aria-label="Create Collection"]'
							);
							if (createButton instanceof HTMLElement) {
								createButton.click();
							}
						}}
						icon="ic:round-plus"
						borderRadius={"28px"}
						bgColor={"star.100"}
						color={"star.800"}
						_hover={{ bgColor: "star.200" }}
					>
						Create Collection
					</ButtonWithIcon> */}
          <Box>
            <CreateCollectionModal onSubmit={handleCollectionCreated} />
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default Collection;
