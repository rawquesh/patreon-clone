import React from "react";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { Flex, Stack, Text, Box, Heading } from "@chakra-ui/react";
import PostLike from "./post-like";
import PostComments from "./post-comments";
import RichTextPreview from "./RichTextPreview";
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
        size="md"
        fontWeight={600}
        cursor="pointer"
        _hover={!locked ? { textDecoration: "underline" } : {}}
        mb={1}
        css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
      >
        {title}
      </Heading>
    </Link>
  );

  return (
    <Stack
      className="glass-card"
      w="100%"
      p={{ base: "16px", md: "20px" }}
      gap={3}
      borderRadius="16px"
    >
      {header}
      <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
        {getTimeAgo(timeStamp)}
      </Text>

      {hasAccess ? (
        <Box mt={4} position="relative">
          <Box maxH="100px" overflow="hidden" pointerEvents="none">
            <RichTextPreview
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
                w="fit"
                icon="tabler:lock-filled"
                size="sm"
                css={{
                  background: "var(--gradient-primary)",
                  borderRadius: "10px",
                  fontWeight: 600,
                  marginTop: "8px",
                }}
              >
                Join to unlock
              </ButtonWithIcon>
            </ScrollLink>
          )}
        </Box>
      )}

      <Flex
        mt={locked ? 6 : 2}
        pt={3}
        borderTopWidth="1px"
        borderColor="hsl(210, 30%, 88%)"
        justifyContent="space-between"
        alignItems="center"
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
