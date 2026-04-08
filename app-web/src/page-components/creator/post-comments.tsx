"use client";

import React from "react";
import IconText from "@/components/ui/icon-text";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.provider";
import { Box } from "@chakra-ui/react";

interface PostCommentsProps {
  commentsCount: number;
  postId: string;
}

const PostComments: React.FC<PostCommentsProps> = ({
  commentsCount,
  postId,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <Box
      onClick={() => {
        if (!user) {
          router.push(`/auth/login`);
        } else {
          router.push(`/post/${postId}`);
        }
      }}
    >
      <IconText
        icon="iconamoon:comment-fill"
        text={String(commentsCount)}
        containerProps={{
          cursor: "pointer",
        }}
      />
    </Box>
  );
};

export default PostComments;
