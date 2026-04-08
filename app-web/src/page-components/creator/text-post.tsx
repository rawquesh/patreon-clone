import React from "react";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { Flex, Stack, Text, Box, Heading } from "@chakra-ui/react"; // Added Heading
import PostLike from "./post-like";
import PostComments from "./post-comments";
import RichTextPreview from "./RichTextPreview"; // Import the new component
import { ShareButton } from "./share-button";
import Link from "next/link";
import { UpgradeModal } from "@/components/upgrade-modal";
import { TierAccess } from "@/typings/ITierAccess";
import { Link as ScrollLink } from "react-scroll";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { useAuth } from "@/context/auth.provider";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  timeStamp: string;
  body: string;
  likes: number;
  comments: number;
  locked: boolean;
  postId: string;
  previewText?: string;
  hasAccess: boolean;
  tierAccess: TierAccess[];
  isSubscribed: boolean;
}

const TextPost: React.FC<Props> = ({
  comments,
  likes,
  timeStamp,
  title,
  locked,
  postId,
  previewText,
  hasAccess,
  tierAccess,
  isSubscribed,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const header = (
    <Link href={`/post/${postId}`}>
      <Heading
        as="h2"
        size="lg"
        fontWeight={600}
        cursor={"pointer"}
        _hover={!locked ? { textDecoration: "underline" } : {}}
        mb={1}
      >
        {title}
      </Heading>
    </Link>
  );

  return (
    <Stack
      borderRadius={"12px"}
      bg="white"
      shadow={"md"}
      w={"100%"}
      p={{ base: "16px", md: "24px" }}
      gap={3}
    >
      {header}
      <Text fontSize={"xs"} color={"gray.500"}>
        {getTimeAgo(timeStamp)}
      </Text>

      {hasAccess ? (
        <Box mt={4} position="relative">
          <Box
            maxH="100px"
            overflow="hidden"
            // filter="blur(2px)"
            pointerEvents="none"
          >
            <RichTextPreview
              // htmlContent={body}
              htmlContent={previewText!}
              postId={postId}
              maxHeight="100px"
            />
          </Box>
        </Box>
      ) : (
        <Box cursor="pointer">
          <RichTextPreview
            htmlContent={previewText!}
            postId={postId}
            maxHeight="100px"
          />
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
                size="sm"
              >
                Join to unlock
              </ButtonWithIcon>
            </ScrollLink>
          )}
        </Box>
      )}

      <Flex
        color={"gray.600"}
        mt={locked ? 6 : 2}
        pt={3}
        borderTop="1px"
        borderColor="gray.100"
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Flex gap={4}>
          <PostLike likes={likes} postId={postId} />
          <PostComments commentsCount={comments} postId={postId} />
        </Flex>
        <Flex gap={4}>
          <ShareButton postId={postId} />
        </Flex>
      </Flex>
    </Stack>
  );
};

export default TextPost;
