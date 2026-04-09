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
            glass
            startElement={
              <Icon
                icon="material-symbols:search"
                style={{ color: "hsl(215.4, 16.3%, 46.9%)", width: "20px", height: "20px" }}
              />
            }
            w={{ base: "100%", lg: "40%" }}
            mx="auto"
          >
            <Input
              placeholder="Search creators or topics"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={onOpen}
              borderRadius="9999px"
              h="48px"
              css={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.5)",
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
                "&:focus": {
                  background: "rgba(255, 255, 255, 0.9)",
                  borderColor: "hsl(211, 71%, 43%)",
                  boxShadow: "0 0 0 3px hsl(211, 71%, 43% / 0.1), 0 0 20px hsl(211, 71%, 43% / 0.2)",
                  outline: "none",
                },
                "&::placeholder": {
                  color: "hsl(215.4, 16.3%, 46.9%)",
                },
              }}
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
            css={{
              background: "rgba(0, 0, 0, 0.25)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
            }}
            onClick={onClose}
          />
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            mt={2}
            className="glass-card"
            borderRadius="16px"
            zIndex={101}
            maxH="500px"
            overflowY="auto"
            onClick={(e) => e.stopPropagation()}
            p={2}
          >
            {isLoading ? (
              <Flex justify="center" p={4}>
                <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Loading...</Text>
              </Flex>
            ) : (
              <Stack gap={0}>
                {searchResults?.creators &&
                  searchResults.creators.length > 0 && (
                    <>
                      <Text p={3} fontWeight={600} fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Creators
                      </Text>
                      {searchResults.creators.map((creator) => (
                        <Box
                          key={creator._id}
                          p={3}
                          borderRadius="10px"
                          cursor="pointer"
                          transition="all 0.15s ease"
                          _hover={{ bg: "primary.50" }}
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
                              <Text fontWeight={600} fontSize="sm" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                                {creator.creatorUsername}
                              </Text>
                              <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                                {creator.creatorHeadline}
                              </Text>
                            </Box>
                          </Flex>
                        </Box>
                      ))}
                      {searchResults.topics && searchResults.topics.length > 0 && (
                        <Box
                          borderBottom="1px solid"
                          borderColor="hsl(210, 30%, 88%)"
                          my={2}
                        />
                      )}
                    </>
                  )}

                {searchResults?.topics && searchResults.topics.length > 0 && (
                  <>
                    <Text p={3} fontWeight={600} fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Topics
                    </Text>
                    {searchResults.topics.map((topic) => (
                      <Box
                        key={topic}
                        p={3}
                        borderRadius="10px"
                        cursor="pointer"
                        transition="all 0.15s ease"
                        _hover={{ bg: "primary.50" }}
                        onClick={() => handleTopicClick(topic)}
                      >
                        <Flex align="center" gap={3}>
                          <Icon
                            icon="material-symbols:tag"
                            style={{ color: "hsl(211, 71%, 43%)", width: "18px", height: "18px" }}
                          />
                          <Text fontSize="sm" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{topic}</Text>
                        </Flex>
                      </Box>
                    ))}
                  </>
                )}

                {(!searchResults?.creators ||
                  searchResults.creators.length === 0) &&
                  (!searchResults?.topics ||
                    searchResults.topics.length === 0) && (
                    <Text p={4} textAlign="center" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
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
