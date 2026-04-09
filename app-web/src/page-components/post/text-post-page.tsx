"use client";

import {
  Box,
  Flex,
  Stack,
  Text,
  Link,
  Heading,
  Image,
  List,
  Code,
} from "@chakra-ui/react";
import React, { Suspense } from "react";
import PostPageCreatorInfo from "./post-page-creator-info";
import PostLike from "./post-like";
import IconText from "@/components/ui/icon-text";
import PostCommentsSection from "./post-comments-section";
import { PostData } from "@/typings/IPost";
// import {
//   usePostLikes,
//   usePostComments,
// } from "@/lib/backend-services/post-service";

import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import { useAuth } from "@/context/auth.provider";
import { useRouter } from "next/navigation";
import Attachments from "../creator/attchments";
// import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useSubscription } from "@/context/subscription.provider";

const TextPostPageComponent: React.FC<{
  postData: PostData;
  postId: string;
}> = ({ postData, postId }) => {
  const { textContent, creator, hasAccess } = postData;
  const { subscriptions } = useSubscription();
  const isSubscribed = subscriptions.some(
    (subscription) =>
      subscription.creator._id === postData.creator.id &&
      subscription.status === "active"
  );

  // const { data: likesData } = usePostLikes(postId);
  // const { data: commentsData } = usePostComments(postId);
  const { user } = useAuth();
  const router = useRouter();
  // const likesCount = likesData?.pagination?.total || 0;
  // const commentsCount = commentsData?.pagination?.total || 0;

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
              return <Box h="1em" />;
            }
            return (
              <Text fontSize={"16px"} my={3}>
                {reactChildren}
              </Text>
            );
          case "a":
            return (
              <Link href={attribs.href} css={{ color: "hsl(211, 71%, 43%)" }} target="_blank">
                {reactChildren}
              </Link>
            );
          case "img":
            return (
              <Image
                src={attribs.src}
                alt={attribs.alt || "Post image"}
                my={4}
                maxW="100%"
                h="auto"
                objectFit="contain"
                borderRadius="md"
              />
            );
          case "ul":
            return (
              <List.Root as="ul" my={3} pl={4}>
                {reactChildren}
              </List.Root>
            );
          case "ol":
            return (
              <List.Root as="ol" my={3} pl={4}>
                {reactChildren}
              </List.Root>
            );
          case "li":
            return <List.Item>{reactChildren}</List.Item>;
          case "pre":
            if (attribs.class?.includes("ql-syntax")) {
              return (
                <Box
                  as="pre"
                  p={4}
                  my={4}
                  css={{ background: "hsl(222.2, 47.4%, 11.2%)", color: "hsl(210, 40%, 96%)" }}
                  borderRadius="md"
                  overflowX="auto"
                  fontSize="sm" // Smaller font for code
                  fontFamily="monospace"
                  css={{
                    // Target inner code elements if needed
                    code: { fontFamily: "monospace !important" },
                  }}
                >
                  {reactChildren}
                </Box>
              );
            }
            return (
              <Code as="pre" p={3} my={3} display="block" whiteSpace="pre-wrap">
                {reactChildren}
              </Code>
            );

          case "div":
            if (
              attribs.class?.includes("ql-code-block-container") ||
              attribs.class?.includes("ql-code-block")
            ) {
              return (
                <Box
                  as="pre"
                  p={4}
                  my={4}
                  css={{ background: "hsl(222.2, 47.4%, 11.2%)", color: "hsl(210, 40%, 96%)" }}
                  borderRadius="md"
                  overflowX="auto"
                  fontSize="sm"
                  fontFamily="monospace"
                >
                  {reactChildren}
                </Box>
              );
            }
            return <>{reactChildren}</>;

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
                css={{ borderColor: "hsl(210, 30%, 88%)" }}
                pl={4}
                my={4}
                fontStyle="italic"
                css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
              >
                {reactChildren}
              </Box>
            );
          case "br":
            // Usually handled within parent elements, but can add explicit break if needed
            return <br />;

          // Add more tag replacements as needed (e.g., tables, blockquotes)
        }
      }
    },
  };

  return (
    <Flex
      p={{ base: "16px", md: "24px" }} // Responsive padding
      w="100%" // Use 100% width for better control within parent
      direction={{ base: "column-reverse", lg: "row" }}
      maxW="1150px"
      mx="auto"
      gap={8}
    >
      <Box flexGrow={1} w={{ base: "100%", lg: "calc(100% - 320px - 32px)" }}>
        {" "}
        <Stack gap={0}>
          <Box className="post-content">
            {parse(textContent || postData.previewText || "", parserOptions)}
          </Box>
          {isSubscribed && !hasAccess && (
            <UpgradeModal tierAccess={postData.tierAccess} />
          )}

          <Attachments attachments={postData.attachments || []} />

          {/* Likes and Comments Count */}
          <Flex my={6} gap={4} borderTop="1px" css={{ borderColor: "hsl(210, 30%, 88%)" }} pt={4}>
            {" "}
            {/* Add separator */}
            <Suspense>
              {/* Ensure PostLike fetches its own data or receives correct initial props */}
              <PostLike postId={postId} likes={postData.likesCount} />
            </Suspense>
            <Box
              onClick={() => {
                if (!user) {
                  router.push(`/auth/login`);
                }
              }}
            >
              <IconText
                containerProps={{
                  cursor: "pointer",
                  onClick: () =>
                    document
                      .getElementById("comments-section")
                      ?.scrollIntoView({ behavior: "smooth" }),
                }} // Scroll to comments
                icon="iconamoon:comment-fill"
                text={String(postData.commentsCount)}
              />
            </Box>
            {/* Add Share Button Here */}
          </Flex>

          {/* Comments Section */}
          <Box id="comments-section" pt={4}>
            {" "}
            {/* Add ID for scrolling */}
            <Suspense>
              <PostCommentsSection className="glass-card" postId={postId} />
            </Suspense>
          </Box>
        </Stack>
      </Box>

      {!hasAccess && (
        <Box
          w={{ base: "100%", lg: "320px" }} // Fixed width on large screens
          flexShrink={0}
          position={{ lg: "sticky" }} // Make sidebar sticky on large screens
          top={{ lg: "80px" }} // Adjust top offset as needed (e.g., height of your header)
          alignSelf={{ lg: "flex-start" }} // Align to top
          height={{ lg: "calc(100vh - 100px)" }} // Prevent excessive height
          // overflowY="auto" // Allow scrolling within sidebar if content exceeds height
        >
          <PostPageCreatorInfo
            avatarUrl={creator.profilePicture || ""}
            description={creator.description || "Content creator"}
            // membership="$5 per month"
            username={creator.username}
            tierAccess={postData.tierAccess}
            id={postData.creator.id}
          />
        </Box>
      )}
    </Flex>
  );
};

export default TextPostPageComponent;
