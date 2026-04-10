import { branding } from "@/config/branding";
import {
  Image,
  Stack,
  Text,
  Spinner,
  Center,
  Button,
  Box,
  useDisclosure,
  Link,
  HStack,
  Heading,
  List,
  // ListItem,
  Code,
  AspectRatio,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback } from "react";
import AboutModal from "./about-modal";
import api from "@/lib/api"; // Import api instance
import { Icon } from "@iconify/react/dist/iconify.js"; // Import Icon for social link display
import { useAuth } from "@/context/auth.provider";
import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";

// Define the structure of the About data based on the backend
interface AboutData {
  introVideoUrl?: string;
  bio?: string;
  socialLinks?: { platform: string; url: string; icon?: string }[]; // Icon might be optional from backend
}

// --- Helper function for YouTube URLs ---
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

// --- Display Component (Updated) ---
const DisplayAboutDetails: React.FC<{
  aboutData: AboutData;
  onEdit: () => void;
}> = ({ aboutData, onEdit }) => {
  // --- Parser Options (similar to TextPostPageComponent) ---
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
                css={{ color: "hsl(211, 71%, 43%)" }}
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
            return <List.Root as={"li"}>{reactChildren}</List.Root>;
          case "pre":
            // Handle syntax highlighting block from PrimeReact editor
            if (attribs.class?.includes("ql-syntax")) {
              return (
                <Box
                  as="pre"
                  p={4}
                  my={4}
                  css={{
                    background: "hsl(222.2, 47.4%, 11.2%)",
                    color: "hsl(210, 40%, 96%)",
                    borderRadius: "md",
                    overflowX: "auto",
                    fontSize: "sm",
                    fontFamily: "monospace",
                    code: { fontFamily: "monospace !important" },
                  }}
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
                css={{ background: "hsl(210, 30%, 88%)" }}
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
                css={{ borderColor: "hsl(210, 30%, 88%)", color: "hsl(215.4, 16.3%, 46.9%)" }}
                pl={4}
                my={4}
                fontStyle="italic"
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
    <Stack gap={4} textAlign="left">
      {aboutData.introVideoUrl && (
        <Box>
          <Text fontWeight={600} mb={2}>
            Intro Video
          </Text>
          {introVideoId ? (
            <AspectRatio ratio={16 / 9} maxW="560px" mx="auto">
              <iframe
                title="Intro Video"
                src={`https://www.youtube.com/embed/${introVideoId}`}
                allowFullScreen
              />
            </AspectRatio>
          ) : (
            // Fallback to link if not a valid YouTube URL or ID extraction failed
            <Link
              href={aboutData.introVideoUrl}
              target="_blank"
              css={{ color: "hsl(211, 71%, 43%)" }}
            >
              Watch Video{" "}
              <Icon icon="mdi:external-link" display="inline-block" />
            </Link>
          )}
        </Box>
      )}
      {aboutData.bio && (
        <Box>
          <Text fontWeight={600} mb={2}>
            Bio
          </Text>
          {/* Render the parsed HTML content for bio */}
          <Box className="about-bio-content">
            {parse(aboutData.bio, parserOptions)}
          </Box>
        </Box>
      )}
      {aboutData.socialLinks && aboutData.socialLinks.length > 0 && (
        <Box>
          <Text fontWeight={600} mb={2}>
            Social Links
          </Text>
          <Stack gap={2}>
            {aboutData.socialLinks.map((link) => (
              <Link key={link.platform} href={link.url} target="_blank">
                <HStack gap={2}>
                  <Icon icon={link.icon || "mdi:link"} fontSize="20px" />
                  <Text>{link.platform}</Text>
                </HStack>
              </Link>
            ))}
          </Stack>
        </Box>
      )}
      <Button onClick={onEdit} variant="outline" alignSelf="flex-start" mt={4}>
        Edit Details
      </Button>
    </Stack>
  );
};
// --- End Display Component ---

const AboutPage: React.FC<{ creatorUsername: string }> = ({
  creatorUsername,
}) => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { open, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();

  const fetchAboutData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming /users/me returns { ..., about: AboutData, ... }
      const { data } = await api.get<{
        introVideoUrl?: string; // Optional: URL string if available
        bio?: string; // Optional: String if available
        socialLinks?: Array<{
          // Optional: Array of objects if available, otherwise an empty array []
          platform: string;
          url: string;
        }>;
      }>(`/users/creator/${creatorUsername}/about`);
      // ;
      // console.log(data);
      setAboutData(data || null);
    } catch (err) {
      console.error("Failed to fetch about data:", err);
      setError("Could not load about information.");
      setAboutData(null);
    } finally {
      setIsLoading(false);
    }
  }, [creatorUsername]);

  useEffect(() => {
    fetchAboutData();
  }, [fetchAboutData, user]);

  // Check if there is any content to display
  const hasContent = Boolean(
    aboutData?.introVideoUrl ||
      aboutData?.bio ||
      (aboutData?.socialLinks && aboutData.socialLinks.length > 0)
  );

  const handleModalClose = () => {
    onClose();
  };

  const handleModalUpdate = () => {
    onClose();
    // Refetch data after successful update
    fetchAboutData();
  };

  console.log(aboutData, hasContent);

  return (
    <Stack
      boxShadow={"md"}
      w={{ base: "90%", lg: "650px" }}
      borderRadius={"6px"}
      mx={"auto"}
      p={"24px"}
      className="glass-card"
      // Keep textAlign center for the placeholder, but details will be left-aligned
      // textAlign={"center"}
    >
      {isLoading && (
        <Center h="200px">
          <Spinner />
        </Center>
      )}

      {!isLoading && error && (
        <Center h="200px" flexDirection="column">
          <Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>{error}</Text>
          <Button onClick={fetchAboutData} mt={4} size="sm">
            Retry
          </Button>
        </Center>
      )}

      {!isLoading && !error && hasContent && aboutData && (
        <DisplayAboutDetails aboutData={aboutData} onEdit={onOpen} />
      )}

      {!isLoading && !error && !hasContent && (
        <Stack textAlign={"center"} gap={4}>
          <Image
            h={"115px"}
            src="/images/about-module.png"
            alt="about"
            objectFit={"contain"}
            alignSelf="center"
          />
          <Text fontWeight={600}>Introduce yourself</Text>
          <Text>
            Help people coming to your page get to know you. Share more about
            who you are, what you create, and why you&apos;re on {branding.name}!
          </Text>
          {/* Trigger Button for Modal */}
          <Button onClick={onOpen} mx={"auto"} w={"fit"} variant={"outline"}>
            Add details
          </Button>
        </Stack>
      )}

      {/* Render modal outside conditional blocks, control visibility with isOpen */}
      <AboutModal
        isOpen={open}
        onClose={handleModalClose}
        onUpdate={handleModalUpdate} // Pass callback to refresh data
        initialData={aboutData} // Pass existing data or null
      />
    </Stack>
  );
};

export default AboutPage;
