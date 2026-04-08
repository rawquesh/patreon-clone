import { InputGroup } from "@/components/ui/input-group";
import { SearchIcon } from "@/icons/search";
import { Box, Flex, Input, Text, Spinner } from "@chakra-ui/react";
import React, { useState, useRef, useCallback, useEffect } from "react";
// import DirectMessagesFilterPopover from "./direct-messagees-filter-popover";
import api from "@/lib/api";
import { useChat } from "@/context/chat.provider";
import { toaster } from "@/components/ui/toaster";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth.provider";

// Simple debounce hook implementation
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface Subscriber {
  subscriptionId: string;
  subscriberId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  membershipTier: string;
  monthlyRate: number;
  subscribedSince: Date;
}

const DirectMessagesSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Subscriber[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { createDirectChat, loadChats } = useChat();
  const { user } = useAuth();

  // Handle clicks outside the search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchSubscribers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const { data } = await api.get<Subscriber[]>(
        "/users/creator/subscribers/search",
        {
          params: { query },
        }
      );
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching subscribers:", error);
      toaster.create({
        title: "Search failed",
        description: "Failed to search for subscribers",
        type: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Search when the debounced query changes
  useEffect(() => {
    searchSubscribers(debouncedQuery);
  }, [debouncedQuery, searchSubscribers]);

  const handleStartChat = async (subscriber: Subscriber) => {
    try {
      await createDirectChat(subscriber.subscriberId, user!._id!);
      setShowResults(false);
      setSearchQuery("");
      loadChats(); // Refresh the chat list
      toaster.create({
        title: "Chat created",
        description: `Started a chat with ${subscriber.firstName} ${subscriber.lastName}`,
      });
    } catch (error) {
      console.error("Failed to create direct chat:", error);
      toaster.create({
        title: "Failed to create chat",
        description: "Could not start a conversation with this subscriber",
        type: "destructive",
      });
    }
  };

  return (
    <Box position="relative" ref={resultsRef}>
      <Flex gap={3} alignItems={"center"}>
        <InputGroup w={"100%"} startElement={<SearchIcon />}>
          <Input
            placeholder="Search or start conversation"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
          />
        </InputGroup>
        {/* <DirectMessagesFilterPopover /> */}
      </Flex>

      {showResults && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={2}
          bg="white"
          boxShadow="md"
          borderRadius="md"
          maxH="300px"
          overflowY="auto"
          zIndex={10}
        >
          {isSearching ? (
            <Flex justify="center" py={4}>
              <Spinner />
            </Flex>
          ) : searchResults.length > 0 ? (
            <Flex direction="column">
              {searchResults.map((subscriber) => (
                <Flex
                  key={subscriber.subscriberId}
                  p={3}
                  alignItems="center"
                  _hover={{ bg: "gray.50" }}
                  cursor="pointer"
                  onClick={() => handleStartChat(subscriber)}
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                >
                  <Avatar
                    size="sm"
                    src={subscriber.profilePicture}
                    name={`${subscriber.firstName} ${subscriber.lastName}`}
                    mr={3}
                  />
                  <Box>
                    <Text fontWeight="medium">
                      {subscriber.firstName} {subscriber.lastName}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {subscriber.membershipTier}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Flex>
          ) : searchQuery.length > 0 ? (
            <Text p={4} textAlign="center" color="gray.500">
              No subscribers found
            </Text>
          ) : null}
        </Box>
      )}
    </Box>
  );
};

export default DirectMessagesSearch;
