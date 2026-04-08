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
    console.log("postId", postId);
    if (!locked) {
      router.push(`/post/${postId}`);
    }
  };

  const header = (
    <Link href={`/post/${postId}`}>
      <Text fontSize={"2xl"} fontWeight={600}>
        {title}
      </Text>
    </Link>
  );

  return (
    <Stack
      borderRadius={"12px"}
      overflow={"hidden"}
      bg="white"
      shadow={"md"}
      w={"100%"}
    >
      {/* <Suspense></Suspense> */}
      {hasAccess && <CustomAudioPlayer src={src} />}
      <Stack p="24px">
        <Heading fontSize={"2xl"} fontWeight={600}>
          {header}
        </Heading>
        <Text fontSize={"sm"} color={"star.600"}>
          {getTimeAgo(timeStamp)}
        </Text>
        {/* {description && <Text>{description}</Text>} */}
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
                    w={"fit"}
                    icon="tabler:lock-filled"
                    onClick={() => {
                      if (!user) {
                        router.push(`/auth/login`);
                      }
                    }}
                  >
                    Join to unlock
                  </ButtonWithIcon>
                </ScrollLink>
              )}
            </>
          ) : (
            <Box
              as="audio"
              // controls
              // src={src}
              width="100%"
              borderRadius="8px"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </Box>
        {(previewText || description) && (
          <Text mb={4} onClick={handlePostClick} cursor="pointer">
            {previewText || description}
          </Text>
        )}
        {/* {!locked && body && (
          <Text mb={4} onClick={handlePostClick} cursor="pointer">
            {body}
          </Text>
        )} */}
        <Flex
          color={"star.600"}
          mt={3}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
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
                textProps={{
                  lineHeight: 1.7,
                  ml: "1px",
                }}
              />
            )}
          </Flex>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default AudioPost;
