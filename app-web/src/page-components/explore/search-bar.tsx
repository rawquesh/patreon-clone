"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Input,
  Flex,
  Text,
  Stack,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { InputGroup } from "@/components/ui/input-group";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface Creator {
  _id: string;
  displayName: string;
  creatorUsername: string;
  profilePicture: string;
  creatorHeadline: string;
}

interface SearchResults {
  creators: Creator[];
  topics: string[];
}

const SearchComponent: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: searchResults, isLoading } = useQuery<SearchResults>({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) {
        return { creators: [], topics: [] };
      }
      const { data } = await api.get(
        `/search?q=${encodeURIComponent(searchQuery)}`
      );
      return data;
    },
    enabled: searchQuery.length >= 2,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  const handleCreatorClick = (username: string) => {
    router.push(`/creator/${username}`);
    onClose();
  };

  const handleTopicClick = (topic: string) => {
    router.push(`/explore?topic=${encodeURIComponent(topic)}`);
    onClose();
  };

  return (
    <Box position="relative" ref={searchRef} width="100%" zIndex={10}>
      <form onSubmit={handleSearch}>
        <Flex justify="center" align="center">
          <InputGroup
            startElement={
              <Icon icon="material-symbols:search" style={{ color: "gray" }} />
            }
            w={{ base: "100%", lg: "40%" }}
            mx="auto"
          >
            <Input
              placeholder="Search creators or topics"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={onOpen}
              borderRadius="full"
              bg="gray.100"
              _hover={{ bg: "gray.200" }}
              _focus={{ bg: "white", boxShadow: "md" }}
            />
          </InputGroup>
        </Flex>
      </form>

      {open && searchQuery.length >= 2 && (
        <>
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.3)"
            zIndex={100}
            onClick={onClose}
          />
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            mt={2}
            bg="white"
            boxShadow="lg"
            borderRadius="md"
            zIndex={101}
            maxH="500px"
            overflowY="auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <Flex justify="center" p={4}>
                <Text>Loading...</Text>
              </Flex>
            ) : (
              <Stack gap={0}>
                {searchResults?.creators &&
                  searchResults.creators.length > 0 && (
                    <>
                      <Text p={3} fontWeight="bold" color="gray.600">
                        Creators
                      </Text>
                      {searchResults.creators.map((creator) => (
                        <Box
                          key={creator._id}
                          p={3}
                          _hover={{ bg: "gray.100" }}
                          cursor="pointer"
                          onClick={() =>
                            handleCreatorClick(creator.creatorUsername)
                          }
                        >
                          <Flex align="center" gap={3}>
                            <Image
                              src={
                                creator.profilePicture ||
                                "/icons/default-avatar.svg"
                              }
                              alt={creator.displayName}
                              boxSize="40px"
                              borderRadius="full"
                              objectFit="cover"
                            />
                            <Box>
                              <Text fontWeight="medium">
                                {creator.creatorUsername}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {creator.creatorHeadline}
                              </Text>
                            </Box>
                          </Flex>
                        </Box>
                      ))}
                      {searchResults.topics &&
                        searchResults.topics.length > 0 && (
                          <Box
                            borderBottom="1px solid"
                            borderColor="gray.200"
                            my={2}
                          />
                        )}
                    </>
                  )}

                {searchResults?.topics && searchResults.topics.length > 0 && (
                  <>
                    <Text p={3} fontWeight="bold" color="gray.600">
                      Topics
                    </Text>
                    {searchResults.topics.map((topic) => (
                      <Box
                        key={topic}
                        p={3}
                        _hover={{ bg: "gray.100" }}
                        cursor="pointer"
                        onClick={() => handleTopicClick(topic)}
                      >
                        <Flex align="center" gap={3}>
                          <Icon
                            icon="material-symbols:tag"
                            width="20"
                            height="20"
                          />
                          <Text>{topic}</Text>
                        </Flex>
                      </Box>
                    ))}
                  </>
                )}

                {(!searchResults?.creators ||
                  searchResults.creators.length === 0) &&
                  (!searchResults?.topics ||
                    searchResults.topics.length === 0) && (
                    <Text p={4} textAlign="center" color="gray.500">
                      No results found
                    </Text>
                  )}
              </Stack>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default SearchComponent;
