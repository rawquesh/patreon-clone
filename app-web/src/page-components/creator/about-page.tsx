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
  socialLinks?: { platform: string; url: string; icon?: string }[];
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
        className="animate-fade-in-up"
        maxW={"648px"}
        pt={6}
        pb={20}
        w={"90vw"}
        mx={"auto"}
        textAlign="center"
      >
        <Box
          w="48px"
          h="48px"
          borderRadius="full"
          border="3px solid hsl(210, 30%, 88%)"
          borderTopColor="hsl(211, 71%, 43%)"
          animation="spin 0.8s linear infinite"
          mx="auto"
          css={{
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      className="animate-fade-in-up"
      maxW={"648px"}
      pt={6}
      pb={20}
      w={"90vw"}
      mx={"auto"}
    >
      {/* Creator Details Section */}
      <Box
        className="glass-card"
        borderRadius="16px"
        p={"24px"}
        mb={6}
      >
        <DisplayAboutDetails
          aboutData={{
            introVideoUrl: stats?.introVideoUrl,
            bio: stats?.bio,
            socialLinks: stats?.socialLinks,
          }}
        />
      </Box>

      {/* Disclaimer Section */}
      {stats?.disclaimer && (
        <Box
          className="glass-card"
          fontSize={"sm"}
          borderRadius="12px"
          p={"24px"}
          mt={6}
        >
          <Text
            fontWeight={600}
            mb={2}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            DISCLAIMER
          </Text>
          <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            {stats.disclaimer}
          </Text>
        </Box>
      )}

      {/* Stats Grid */}
      <Flex
        className="glass-card"
        borderRadius="12px"
        p={"24px"}
        mt={6}
        justifyContent={"space-evenly"}
        direction={{
          base: "column",
          lg: "row",
        }}
        gap={6}
      >
        {[
          { label: "Total members", value: stats?.totalMembers },
          { label: "Paid members", value: stats?.paidMembers },
          { label: "Posts", value: stats?.totalPosts },
        ].map((stat) => (
          <StatRoot key={stat.label} alignItems={"center"} textAlign={"center"}>
            <StatLabel
              css={{
                color: "hsl(215.4, 16.3%, 46.9%)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {stat.label}
            </StatLabel>
            <StatValueText
              css={{
                color: "hsl(222.2, 47.4%, 11.2%)",
                fontSize: "28px",
                fontWeight: 700,
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {stat.value?.toLocaleString() || "0"}
            </StatValueText>
          </StatRoot>
        ))}
      </Flex>
    </Box>
  );
};

export default AboutPage;

interface AboutData {
  introVideoUrl?: string;
  bio?: string;
  socialLinks?: { platform: string; url: string; icon?: string }[];
}

const DisplayAboutDetails: React.FC<{
  aboutData: AboutData;
}> = ({ aboutData }) => {
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.type === "tag") {
        const { name, attribs, children } = domNode;
        const reactChildren = domToReact(children as DOMNode[], parserOptions);

        switch (name) {
          case "h1":
            return (
              <Heading as="h1" size="xl" my={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                {reactChildren}
              </Heading>
            );
          case "h2":
            return (
              <Heading as="h2" size="lg" my={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                {reactChildren}
              </Heading>
            );
          case "h3":
            return (
              <Heading as="h3" size="md" my={3} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                {reactChildren}
              </Heading>
            );
          case "h4":
            return (
              <Heading as="h4" size="sm" my={2} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                {reactChildren}
              </Heading>
            );
          case "p":
            if (
              children.length === 1 &&
              children[0].type === "tag" &&
              children[0].name === "br"
            ) {
              return <Box h="1em" />;
            }
            return (
              <Text my={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {reactChildren}
              </Text>
            );
          case "a":
            return (
              <Link
                href={attribs.href}
                css={{ color: "hsl(211, 71%, 43%)" }}
                target="_blank"
                rel="noopener noreferrer"
                _hover={{ textDecoration: "underline" }}
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
            return (
              <ListItem css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {reactChildren}
              </ListItem>
            );
          case "pre":
            if (attribs.class?.includes("ql-syntax")) {
              return (
                <Box
                  as="pre"
                  p={4}
                  my={4}
                  css={{
                    background: "hsl(222.2, 28%, 12%)",
                    color: "hsl(210, 40%, 96%)",
                    borderRadius: "8px",
                    overflowX: "auto",
                    fontSize: "13px",
                    fontFamily: "monospace",
                  }}
                >
                  {reactChildren}
                </Box>
              );
            }
            return (
              <Code
                as="pre"
                p={3}
                my={3}
                display="block"
                whiteSpace="pre-wrap"
                fontSize="sm"
                fontFamily="monospace"
                css={{ background: "hsl(210, 20%, 96%)", borderRadius: "6px" }}
              >
                {reactChildren}
              </Code>
            );

          case "strong":
          case "b":
            return (
              <Text as="strong" fontWeight="bold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                {reactChildren}
              </Text>
            );
          case "em":
          case "i":
            return (
              <Text as="em" fontStyle="italic" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {reactChildren}
              </Text>
            );
          case "u":
            return (
              <Text as="u" textDecoration="underline" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {reactChildren}
              </Text>
            );
          case "s":
            return (
              <Text as="s" textDecoration="line-through" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {reactChildren}
              </Text>
            );
          case "blockquote":
            return (
              <Box
                as="blockquote"
                borderLeft="3px solid"
                css={{
                  borderColor: "hsl(211, 71%, 43%)",
                  pl: "16px",
                  my: "16px",
                  fontStyle: "italic",
                  color: "hsl(215.4, 16.3%, 46.9%)",
                }}
              >
                {reactChildren}
              </Box>
            );
          case "br":
            return <br />;

          default:
            return <>{reactChildren}</>;
        }
      }
    },
  };

  const introVideoId = aboutData.introVideoUrl
    ? getYouTubeVideoId(aboutData.introVideoUrl)
    : null;

  return (
    <Stack gap={6} textAlign="left" w="100%">
      {aboutData.introVideoUrl && (
        <Box w="100%">
          <Text
            fontWeight={600}
            mb={2}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Intro Video
          </Text>
          {introVideoId ? (
            <AspectRatio ratio={16 / 9} maxW="560px" mx="auto" w="100%">
              <iframe
                title="Intro Video"
                src={`https://www.youtube.com/embed/${introVideoId}`}
                allowFullScreen
                style={{ border: 0, borderRadius: "12px" }}
              />
            </AspectRatio>
          ) : (
            <Link
              href={aboutData.introVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              css={{ color: "hsl(211, 71%, 43%)" }}
            >
              Watch Video{" "}
              <Icon icon="mdi:external-link" display="inline-block" />
            </Link>
          )}
        </Box>
      )}
      {aboutData.bio && (
        <Box w="100%">
          <Text
            fontWeight={600}
            mb={2}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Bio
          </Text>
          <Box className="about-bio-content">
            {parse(aboutData.bio || "", parserOptions)}
          </Box>
        </Box>
      )}
      {aboutData.socialLinks && aboutData.socialLinks.length > 0 && (
        <Box w="100%">
          <Text
            fontWeight={600}
            mb={2}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Social Links
          </Text>
          <Stack gap={3}>
            {aboutData.socialLinks.map((link) => (
              <Link
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                css={{
                  color: "hsl(211, 71%, 43%)",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <HStack gap={2}>
                  <Icon icon={link.icon || "mdi:link"} fontSize="20px" />
                  <Text fontWeight={500}>{link.platform}</Text>
                </HStack>
              </Link>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

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
      videoId = urlObj.pathname.substring(1);
    }
  } catch (e) {
    console.error("Invalid URL format for YouTube check:", url, e);
    return null;
  }
  if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return videoId;
  }
  return null;
};
