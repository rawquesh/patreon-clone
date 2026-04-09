"use client";

import React from "react";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import IconText from "@/components/ui/icon-text";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { Flex, Stack, Text, Box, Heading } from "@chakra-ui/react";
import CustomAudioPlayer from "@/components/audio-player";
import Link from "next/link";
import PostLike from "./post-like";
import PostComments from "./post-comments";
import { useRouter } from "next/navigation";
import { ShareButton } from "./share-button";
import { Link as ScrollLink } from "react-scroll";
import { TierAccess } from "@/typings/ITierAccess";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useAuth } from "@/context/auth.provider";

interface Props {
  src: string;
  locked: boolean;
  title: string;
  timeStamp: string;
  body: string;
  likes: number;
  comments: number;
  postId: string;
  description?: string;
  previewText?: string;
  hasAccess: boolean;
  tierAccess: TierAccess[];
  isSubscribed: boolean;
}

const AudioPost: React.FC<Props> = ({
  comments,
  likes,
  src,
  timeStamp,
  title,
  locked,
  postId,
  description,
  previewText,
  hasAccess,
  tierAccess,
  isSubscribed,
}) => {
  const router = useRouter();
  const { user } = useAuth();

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
      {hasAccess && <CustomAudioPlayer src={src} />}
      <Stack p="20px">
        <Link href={`/post/${postId}`}>
          <Heading fontSize="lg" fontWeight={600} cursor="pointer" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            {title}
          </Heading>
        </Link>
        <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          {getTimeAgo(timeStamp)}
        </Text>
        <Box mb={4}>
          {!hasAccess ? (
            <>
              {isSubscribed ? (
                <UpgradeModal tierAccess={tierAccess} />
              ) : (
                <ScrollLink to="memberships" smooth>
                  <ButtonWithIcon
                    mt={4}
                    mb={2}
                    w="fit"
                    icon="tabler:lock-filled"
                    onClick={() => {
                      if (!user) {
                        router.push(`/auth/login`);
                      }
                    }}
                    css={{
                      background: "var(--gradient-primary)",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    Join to unlock
                  </ButtonWithIcon>
                </ScrollLink>
              )}
            </>
          ) : null}
        </Box>
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

export default AudioPost;
