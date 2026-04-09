"use client";

import React from "react";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import IconText from "@/components/ui/icon-text";
import { getTimeAgo } from "@/utils/getTimeAgo";
import {
  Flex,
  Stack,
  Text,
  Box,
  Link as ChakraLink,
  Heading,
} from "@chakra-ui/react";
import Link from "next/link";
import PostLike from "./post-like";
import PostComments from "./post-comments";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ShareButton } from "./share-button";
import { Link as ScrollLink } from "react-scroll";
import { TierAccess } from "@/typings/ITierAccess";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useAuth } from "@/context/auth.provider";

interface Props {
  linkUrl?: string;
  locked: boolean;
  title: string;
  timeStamp: string;
  body: string;
  likes: number;
  comments: number;
  postId: string;
  description?: string;
  previewText?: string;
  tierAccess: TierAccess[];
  isSubscribed: boolean;
  hasAccess: boolean;
}

const LinkPost: React.FC<Props> = ({
  comments,
  likes,
  linkUrl,
  timeStamp,
  title,
  locked,
  postId,
  description,
  previewText,
  isSubscribed,
  tierAccess,
  hasAccess,
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const handlePostClick = () => {
    if (!locked) {
      router.push(`/post/${postId}`);
    }
  };

  return (
    <Stack
      className="glass-card"
      w="100%"
      borderRadius="16px"
      overflow="hidden"
    >
      <Stack p="20px">
        <Link href={`/post/${postId}`}>
          <Heading fontSize="lg" fontWeight={600} cursor="pointer" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            {title}
          </Heading>
        </Link>
        <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          {getTimeAgo(timeStamp)}
        </Text>

        {hasAccess ? (
          <Box
            className="glass-surface"
            p={4}
            borderRadius="10px"
            mb={4}
            display="flex"
            alignItems="center"
          >
            <Icon
              icon="clarity:link-solid"
              style={{ marginRight: "8px", color: "hsl(211, 71%, 43%)" }}
            />
            <ChakraLink
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              fontSize="sm"
              css={{
                color: "hsl(211, 71%, 43%)",
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {linkUrl}
            </ChakraLink>
          </Box>
        ) : (
          <Box
            borderRadius="10px"
            className="glass-surface"
            p={4}
            textAlign="center"
            position="relative"
            mb={4}
          >
            {isSubscribed ? (
              <UpgradeModal tierAccess={tierAccess} />
            ) : (
              <ScrollLink to="memberships" smooth>
                <ButtonWithIcon
                  onClick={() => {
                    if (!user) {
                      router.push(`/auth/login`);
                    }
                  }}
                  w="fit"
                  icon="tabler:lock-filled"
                  css={{
                    background: "var(--gradient-primary)",
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                >
                  Join to unlock link
                </ButtonWithIcon>
              </ScrollLink>
            )}
          </Box>
        )}

        {(previewText || description) && (
          <Text mb={4} onClick={handlePostClick} cursor="pointer" fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            {previewText || description}
          </Text>
        )}
        <Flex mt={3} justifyContent="space-between" alignItems="center">
          <Flex gap={4}>
            <PostLike likes={likes} liked={false} postId={postId} />
            <PostComments commentsCount={comments} postId={postId} />
          </Flex>
          <Flex gap={4}>
            <ShareButton postId={postId} />
            {locked && (
              <IconText
                containerProps={{ cursor: "pointer" }}
                icon="tabler:lock-filled"
                text="Locked"
                textProps={{ lineHeight: 1.7, ml: "1px" }}
              />
            )}
          </Flex>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default LinkPost;
