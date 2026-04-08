import { StatLabel, StatRoot, StatValueText } from "@/components/ui/stat";
import {
  Box,
  Flex,
  Spinner,
  Stack,
  Text,
  HStack,
  Link,
  Heading,
  List,
  ListItem,
  Code,
  AspectRatio,
  Image,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useCreator } from "@/lib/backend-services/creator-service";
import api from "@/lib/api";
import { Icon } from "@iconify/react/dist/iconify.js";
import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";

interface CreatorStats {
  totalMembers: number;
  paidMembers: number;
  totalPosts: number;
  about?: string;
  disclaimer?: string;
  introVideoUrl?: string;
  bio?: string;
  socialLinks?: { platform: string; url: string; icon?: string }[]; // Icon might be optional from backend
}

const AboutPage: React.FC<{
  creatorId: string;
  creatorUsername: string;
}> = ({ creatorId }) => {
  const { data: creator, isLoading: creatorLoading } = useCreator();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<CreatorStats>(
          `/creator/${creatorId}/stats`
        );
        setStats(data);
      } catch (error) {
        console.error("Error fetching creator stats:", error);
        // Fallback data for development/demo
        setStats({
          totalMembers: 12500,
          paidMembers: 3200,
          totalPosts: 142,
          about: creator?.creatorHeadline || "No description provided.",
          disclaimer:
            "The information provided here is for general educational and informational purposes only and should not be construed as investment advice.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (creatorId) {
      fetchCreatorStats();
    }
  }, [creatorId, creator]);

  if (loading || creatorLoading) {
    return (
      <Box
        maxW={"648px"}
        pt={6}
        pb={20}
        w={"90vw"}
        mx={"auto"}
        textAlign="center"
      >
        <Spinner size="xl" color="green.500" />
      </Box>
    );
  }

  return (
    <Box maxW={"648px"} pt={6} pb={20} w={"90vw"} mx={"auto"}>
      {/* Creator Details Section */}
      <Stack
        direction={{ base: "column", sm: "row" }}
        gap={4}
        alignItems="center"
        mb={6}
        bg={"white"}
        shadow={"md"}
        borderRadius={"12px"}
        p={"24px"}
      >
        <DisplayAboutDetails
          aboutData={{
            introVideoUrl: stats?.introVideoUrl,
            bio: stats?.bio,
            socialLinks: stats?.socialLinks,
          }}
        />
      </Stack>

      {/* New Disclaimer Section */}
      {stats?.disclaimer && (
        <Stack
          bg={"white"}
          shadow={"md"}
          fontSize={"sm"}
          borderRadius={"12px"}
          p={"24px"}
          mt={6}
        >
          <Text fontWeight={600}>DISCLAIMER</Text>
          <Text>{stats.disclaimer}</Text>
        </Stack>
      )}

      <Flex
        bg={"white"}
        shadow={"md"}
        fontSize={"sm"}
        borderRadius={"12px"}
        p={"24px"}
        my={6}
        justifyContent={"space-evenly"}
        direction={{
          base: "column",
          lg: "row",
        }}
      >
        <StatRoot alignItems={"center"} textAlign={"center"}>
          <StatLabel>Total members</StatLabel>
          <StatValueText>
            {stats?.totalMembers?.toLocaleString() || "0"}
          </StatValueText>
        </StatRoot>
        <StatRoot alignItems={"center"} textAlign={"center"}>
          <StatLabel>Paid members</StatLabel>
          <StatValueText>
            {stats?.paidMembers?.toLocaleString() || "0"}
          </StatValueText>
        </StatRoot>
        <StatRoot alignItems={"center"} textAlign={"center"}>
          <StatLabel>Posts</StatLabel>
          <StatValueText>
            {stats?.totalPosts?.toLocaleString() || "0"}
          </StatValueText>
        </StatRoot>
      </Flex>
    </Box>
  );
};

export default AboutPage;

interface AboutData {
  introVideoUrl?: string;
  bio?: string;
  socialLinks?: { platform: string; url: string; icon?: string }[]; // Icon might be optional from backend
}

const DisplayAboutDetails: React.FC<{
  aboutData: AboutData;
}> = ({ aboutData }) => {
  // --- Parser Options (Copied from profile page) ---
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.type === "tag") {
        const { name, attribs, children } = domNode;
        const reactChildren = domToReact(children as DOMNode[], parserOptions);

        switch (name) {
          case "h1":
            return (
              <Heading as="h1" size="xl" my={4}>
                {reactChildren}
              </Heading>
            );
          case "h2":
            return (
              <Heading as="h2" size="lg" my={4}>
                {reactChildren}
              </Heading>
            );
          case "h3":
            return (
              <Heading as="h3" size="md" my={3}>
                {reactChildren}
              </Heading>
            );
          case "h4":
            return (
              <Heading as="h4" size="sm" my={2}>
                {reactChildren}
              </Heading>
            );
          case "p":
            if (
              children.length === 1 &&
              children[0].type === "tag" &&
              children[0].name === "br"
            ) {
              return <Box h="1em" />; // Handle empty paragraph with just <br>
            }
            return <Text my={3}>{reactChildren}</Text>;
          case "a":
            return (
              <Link
                href={attribs.href}
                color="blue.500"
                target="_blank"
                rel="noopener noreferrer"
              >
                {reactChildren}
                <Box as="span" display="inline-block" ml={1}>
                  <Icon icon="mdi:external-link" />
                </Box>
              </Link>
            );
          case "img":
            return (
              <Image
                src={attribs.src}
                alt={attribs.alt || "Bio image"}
                my={4}
                maxW="100%"
                h="auto"
                objectFit="contain"
                borderRadius="md"
              />
            );
          case "ul":
            return (
              <List.Root as={"ul"} my={3} pl={6}>
                {reactChildren}
              </List.Root>
            );
          case "ol":
            return (
              <List.Root as="ol" my={3} pl={6}>
                {reactChildren}
              </List.Root>
            );
          case "li":
            return <ListItem>{reactChildren}</ListItem>;
          case "pre":
            // Handle syntax highlighting block from PrimeReact editor
            if (attribs.class?.includes("ql-syntax")) {
              return (
                <Box
                  as="pre"
                  p={4}
                  my={4}
                  bg="gray.800" // Dark background for code
                  color="gray.100" // Light text
                  borderRadius="md"
                  overflowX="auto"
                  fontSize="sm" // Smaller font for code
                  fontFamily="monospace"
                  css={{ code: { fontFamily: "monospace !important" } }} // Ensure inner code uses monospace
                >
                  {reactChildren}
                </Box>
              );
            }
            // Generic pre tag
            return (
              <Code
                as="pre"
                p={3}
                my={3}
                display="block"
                whiteSpace="pre-wrap"
                fontSize="sm"
                fontFamily="monospace"
                bg="gray.100"
                borderRadius="md"
              >
                {reactChildren}
              </Code>
            );

          // Basic formatting tags
          case "strong":
          case "b":
            return (
              <Text as="strong" fontWeight="bold">
                {reactChildren}
              </Text>
            );
          case "em":
          case "i":
            return (
              <Text as="em" fontStyle="italic">
                {reactChildren}
              </Text>
            );
          case "u":
            return (
              <Text as="u" textDecoration="underline">
                {reactChildren}
              </Text>
            );
          case "s":
            return (
              <Text as="s" textDecoration="line-through">
                {reactChildren}
              </Text>
            );
          case "blockquote":
            return (
              <Box
                as="blockquote"
                borderLeft="4px solid"
                borderColor="gray.300"
                pl={4}
                my={4}
                fontStyle="italic"
                color="gray.600"
              >
                {reactChildren}
              </Box>
            );
          case "br":
            return <br />; // Explicit line break

          // Default: render children without a specific wrapper if tag is unknown/unhandled
          default:
            return <>{reactChildren}</>;
        }
      }
    },
  };
  // --- End Parser Options ---

  const introVideoId = aboutData.introVideoUrl
    ? getYouTubeVideoId(aboutData.introVideoUrl)
    : null;

  return (
    <Stack gap={4} textAlign="left" w="100%">
      {" "}
      {/* Ensure stack takes width */}
      {aboutData.introVideoUrl && (
        <Box w="100%">
          {" "}
          {/* Ensure box takes width */}
          <Text fontWeight={600} mb={2}>
            Intro Video
          </Text>
          {introVideoId ? (
            <AspectRatio ratio={16 / 9} maxW="560px" mx="auto" w="100%">
              <iframe
                title="Intro Video"
                src={`https://www.youtube.com/embed/${introVideoId}`}
                allowFullScreen
                style={{ border: 0 }} // Add style to remove potential iframe border
              />
            </AspectRatio>
          ) : (
            // Fallback to link if not a valid YouTube URL or ID extraction failed
            <Link
              href={aboutData.introVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              color="blue.500"
            >
              Watch Video{" "}
              <Icon icon="mdi:external-link" display="inline-block" />
            </Link>
          )}
        </Box>
      )}
      {aboutData.bio && (
        <Box w="100%">
          {" "}
          {/* Ensure box takes width */}
          <Text fontWeight={600} mb={2}>
            Bio
          </Text>
          {/* Render the parsed HTML content for bio */}
          <Box className="about-bio-content">
            {parse(aboutData.bio || "", parserOptions)}{" "}
            {/* Added fallback for empty bio */}
          </Box>
        </Box>
      )}
      {aboutData.socialLinks && aboutData.socialLinks.length > 0 && (
        <Box w="100%">
          {" "}
          {/* Ensure box takes width */}
          <Text fontWeight={600} mb={2}>
            Social Links
          </Text>
          <Stack gap={2}>
            {aboutData.socialLinks.map((link) => (
              <Link
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HStack gap={2}>
                  <Icon icon={link.icon || "mdi:link"} fontSize="20px" />
                  <Text>{link.platform}</Text>
                </HStack>
              </Link>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

// --- Helper function for YouTube URLs (Copied from profile page) ---
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      videoId = urlObj.searchParams.get("v");
    } else if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.substring(1); // Remove the leading '/'
    }
  } catch (e) {
    console.error("Invalid URL format for YouTube check:", url, e);
    return null;
  }
  // Basic check for valid video ID format (alphanumeric, -, _)
  if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return videoId;
  }
  return null;
};
