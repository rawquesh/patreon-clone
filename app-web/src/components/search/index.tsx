"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  Flex,
  Text,
  Stack,
  Image,
  useDisclosure,
  Portal,
} from "@chakra-ui/react";
import { InputGroup } from "@/components/ui/input-group";
import { Icon } from "@iconify/react/dist/iconify.js";
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
  const { open: isOpen, onOpen, onClose } = useDisclosure();
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

  console.log({ searchQuery });

  return (
    <Box position="relative" ref={searchRef} width="100%">
      <form onSubmit={handleSearch}>
        <InputGroup
          startElement={
            <Icon icon="material-symbols:search" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} />
          }
        >
          <Input
            placeholder="Search creators or topics"
            value={searchQuery}
            onChange={(e) => {
              console.log(e.target.value);
              setSearchQuery(e.target.value);
            }}
            onFocus={onOpen}
            borderRadius="full"
            className="glass-input"
            _hover={{ background: "rgba(255,255,255,0.9)" }}
            _focus={{ background: "rgba(255,255,255,0.9)" }}
          />
        </InputGroup>
      </form>

      {isOpen && searchQuery.length >= 2 && (
        <Portal>
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.3)"
            zIndex="overlay"
            onClick={onClose}
          />
          <Box
            position="absolute"
            top="100%"
            left="0"
            right="0"
            mt={2}
            className="glass-card"
            boxShadow="0 8px 32px hsl(211, 71%, 43% / 0.12)"
            borderRadius="12px"
            zIndex="popover"
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
                      <Text p={3} fontWeight="bold" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                        Creators
                      </Text>
                      {searchResults.creators.map((creator) => (
                        <Box
                          key={creator._id}
                          p={3}
                          _hover={{ background: "rgba(255,255,255,0.6)" }}
                          cursor="pointer"
                          transition="all 0.15s ease"
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
                              <Text fontWeight="medium" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                                {creator.displayName}
                              </Text>
                              <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                                Creating {creator.creatorHeadline}
                              </Text>
                            </Box>
                          </Flex>
                        </Box>
                      ))}
                      {searchResults.topics &&
                        searchResults.topics.length > 0 && (
                          <Box
                            borderBottom="1px solid"
                            css={{ borderColor: "hsl(210, 30%, 88%)" }}
                            my={2}
                          />
                        )}
                    </>
                  )}

                {searchResults?.topics && searchResults.topics.length > 0 && (
                  <>
                    <Text p={3} fontWeight="bold" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                      Topics
                    </Text>
                    {searchResults.topics.map((topic) => (
                      <Box
                        key={topic}
                        p={3}
                        _hover={{ background: "rgba(255,255,255,0.6)" }}
                        cursor="pointer"
                        transition="all 0.15s ease"
                        onClick={() => handleTopicClick(topic)}
                      >
                        <Flex align="center" gap={3}>
                          <Icon
                            icon="material-symbols:tag"
                            width="20px"
                            height="20px"
                            css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
                          />
                          <Text css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{topic}</Text>
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
        </Portal>
      )}
    </Box>
  );
};

export default SearchComponent;
