"use client";

import {
  Box,
  Flex,
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

import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import { useAuth } from "@/context/auth.provider";
import { useRouter } from "next/navigation";
import Attachments from "../creator/attchments";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useSubscription } from "@/context/subscription.provider";
import { Icon } from "@iconify/react/dist/iconify.js";

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

  const { user } = useAuth();
  const router = useRouter();

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
                css={{
                  borderColor: "hsl(210, 30%, 88%)",
                  color: "hsl(215.4, 16.3%, 46.9%)",
                }}
                pl={4}
                my={4}
                fontStyle="italic"
              >
                {reactChildren}
              </Box>
            );
          case "br":
            return <br />;
        }
      }
    },
  };

  return (
    <Flex
      p={{ base: "16px", md: "24px" }}
      w="100%"
      direction={{ base: "column-reverse", lg: "row" }}
      maxW="1150px"
      mx="auto"
      gap={8}
    >
      {/* Main content */}
      <Box flex="1" minW={0}>
        {/* White card container */}
        <Box
          bg="white"
          borderRadius="xl"
          p={{ base: 5, md: 8 }}
          border="1px solid"
          css={{ borderColor: "hsl(210, 30%, 92%)" }}
          boxShadow="0 2px 8px rgba(0,0,0,0.04)"
        >
          <Box className="post-content" position="relative">
            {parse(hasAccess ? (textContent || postData.previewText || "") : (postData.previewText || ""), parserOptions)}

            {!hasAccess && (
              <Box
                position="absolute"
                bottom={0}
                left={0}
                w="100%"
                h="100px"
                bg="linear-gradient(to bottom, transparent, white)"
                pointerEvents="none"
              />
            )}
          </Box>

          {/* Lock UI */}
          {!hasAccess && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              className="glass-card"
              p={8}
              rounded="xl"
              mt={6}
              border="1px solid"
              css={{
                borderColor: "rgba(255,255,255,0.8)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                backgroundImage: "var(--gradient-sidebar)",
              }}
              gap={4}
            >
              <Box
                bg="hsl(210, 30%, 96%)"
                p={4}
                rounded="full"
                color="hsl(211, 71%, 43%)"
              >
                <Icon icon="tabler:lock-filled" width={24} height={24} />
              </Box>
              <Text fontWeight={700} fontSize="lg" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                Unlock this post
              </Text>
              <Text color="hsl(215.4, 16.3%, 46.9%)" textAlign="center" mb={2} maxW="400px">
                Join a membership tier to unlock full access to this post and support the creator.
              </Text>
              <UpgradeModal tierAccess={postData.tierAccess} />
            </Flex>
          )}

          {/* Full access content */}
          {hasAccess && (
            <>
              <Attachments attachments={postData.attachments || []} />

              <Flex my={6} gap={4} borderTop="1px solid" css={{ borderColor: "hsl(210, 30%, 92%)" }} pt={5}>
                <Suspense>
                  <PostLike postId={postId} likes={postData.likesCount} />
                </Suspense>
                <Box>
                  <IconText
                    containerProps={{
                      cursor: "pointer",
                      onClick: () => {
                        if (!user) {
                          router.push(`/auth/login`);
                          return;
                        }
                        document
                          .getElementById("comments-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                      },
                    }}
                    icon="iconamoon:comment-fill"
                    text={String(postData.commentsCount)}
                  />
                </Box>
              </Flex>

              <Box id="comments-section" pt={5}>
                <Suspense>
                  <PostCommentsSection className="glass-card" postId={postId} />
                </Suspense>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Creator Info Sidebar */}
      <Box
        w={{ base: "100%", lg: "320px" }}
        flexShrink={0}
        position={{ lg: "sticky" }}
        top={{ lg: "80px" }}
        alignSelf={{ lg: "flex-start" }}
        height={{ lg: "calc(100vh - 100px)" }}
      >
        <PostPageCreatorInfo
          avatarUrl={creator.profilePicture || ""}
          description={creator.description || "Content creator"}
          username={creator.username}
          tierAccess={postData.tierAccess}
          id={postData.creator.id}
        />
      </Box>
    </Flex>
  );
};

export default TextPostPageComponent;
