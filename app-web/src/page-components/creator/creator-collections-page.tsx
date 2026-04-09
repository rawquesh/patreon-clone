import { Box, Grid, Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCreator } from "@/lib/backend-services/creator-service";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Collection {
  title?: string;
  id: string;
  name: string;
  description: string;
  coverImage: string;
  postCount: number;
}

const CollectionsPage: React.FC<{ creatorId: string }> = ({ creatorId }) => {
  const router = useRouter();
  const { data: creator } = useCreator();

  const { data: collectionsData = { collections: [], count: 0 }, isLoading } =
    useQuery({
      queryKey: ["creatorCollections", creatorId],
      queryFn: async (): Promise<{
        collections: Collection[];
        count: number;
      }> => {
        try {
          const { data } = await api.get<{
            collections: Collection[];
            count: number;
          }>(`/collections/creator/${creatorId}`);
          return data;
        } catch (error) {
          console.error("Error fetching collections:", error);
          return { collections: [], count: 0 };
        }
      },
      enabled: !!creatorId,
    });

  console.log(collectionsData);

  const navigateToCollection = (collectionId: string) => {
    router.push(
      `/creator/${creator?.creatorUsername}/collection/${collectionId}`
    );
  };

  if (isLoading) {
    return (
      <Box
        w={{ base: "90%", lg: "984px" }}
        borderRadius={"6px"}
        mx={"auto"}
        p={"24px"}
        textAlign="center"
      >
        <Spinner size="xl" css={{ color: "hsl(142, 76%, 36%)" }} />
      </Box>
    );
  }

  if (collectionsData.collections.length === 0) {
    return (
      <Box
        w={{ base: "90%", lg: "984px" }}
        borderRadius={"6px"}
        mx={"auto"}
        p={"24px"}
      >
        <Stack textAlign={"center"} mt={6} alignItems={"center"}>
          <Box w={"fit"} css={{ background: "hsl(211, 71%, 43% / 0.1)" }} p={4} borderRadius={"999px"}>
            <Icon height={"36px"} css={{ color: "hsl(211, 71%, 43%)" }} icon={"solar:playlist-bold"} />
          </Box>
          <Text fontSize={"sm"} fontWeight={600}>
            {creator?.displayName || "This creator"} hasn&apos;t created any
            collections yet
          </Text>
        </Stack>
      </Box>
    );
  }

  console.log({ collectionsData });

  return (
    <Box
      w={{ base: "90%", lg: "984px" }}
      borderRadius={"6px"}
      mx={"auto"}
      p={"24px"}
    >
      <Heading fontSize="xl" fontWeight="bold" mb={6}>
        Collections by {creator?.displayName || "this creator"}
      </Heading>

      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={6}
      >
        {(collectionsData.collections || []).map((collection) => (
          <Box
            key={collection.id}
            className="glass-card"
            overflow="hidden"
            cursor="pointer"
            onClick={() => navigateToCollection(collection.id)}
            transition="transform 0.2s"
            _hover={{ transform: "translateY(-4px)" }}
          >
            <Box position="relative" height="160px">
              <Image
                src={
                  collection.coverImage || "/images/collection-placeholder.jpg"
                }
                alt={collection.name}
                layout="fill"
                objectFit="cover"
              />
            </Box>
            <Box p={4}>
              <Text fontWeight="bold" mb={1}>
                {collection.name || collection.title}
              </Text>
              <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} lineClamp={2}>
                {collection.description}
              </Text>
              <Text fontSize="xs" mt={2} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {collection.postCount} posts
              </Text>
            </Box>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default CollectionsPage;
