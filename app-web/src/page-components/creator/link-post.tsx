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
  // body,
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
  // console.log()
  console.log(linkUrl);
  const { user } = useAuth();
  const router = useRouter();

  const handlePostClick = () => {
    if (!locked) {
      router.push(`/post/${postId}`);
    }
  };

  const header = (
    <Link href={`/post/${postId}`}>
      <Heading fontSize={"2xl"} fontWeight={600}>
        {title}
      </Heading>
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
      <Stack p="24px">
        {header}
        <Text fontSize={"sm"} color={"star.600"}>
          {getTimeAgo(timeStamp)}
        </Text>

        {hasAccess ? (
          <Box
            bg="gray.50"
            p={4}
            borderRadius="md"
            mb={6}
            display="flex"
            alignItems="center"
          >
            <Icon icon="clarity:link-solid" style={{ marginRight: "8px" }} />
            <ChakraLink href={linkUrl} color="blue.500">
              {linkUrl}
            </ChakraLink>
          </Box>
        ) : (
          <Box
            borderRadius="8px"
            bg="gray.100"
            p={4}
            textAlign="center"
            position="relative"
            mb={6}
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
                  w={"fit"}
                  icon="tabler:lock-filled"
                >
                  Join to unlock link
                </ButtonWithIcon>
              </ScrollLink>
            )}
          </Box>
        )}

        {/* {!locked && body && (
          <Text mb={4} onClick={handlePostClick} cursor="pointer">
            {body}
          </Text>
        )} */}
        {(previewText || description) && (
          <Text mb={4} onClick={handlePostClick} cursor="pointer">
            {previewText || description}
          </Text>
        )}
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

export default LinkPost;
