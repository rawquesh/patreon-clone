"use client";

import IconText from "@/components/ui/icon-text";
import {
  useLikePost,
  useUnlikePost,
  usePostLiked,
} from "@/lib/backend-services/post-service";
import React, { useEffect, useState } from "react";

interface PostLikeProps {
  likes: number;
  liked?: boolean;
  postId: string;
}

const PostLike: React.FC<PostLikeProps> = ({
  likes: initialLikes,
  liked: initialLiked,
  postId,
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked || false);
  const [likeCount, setLikeCount] = useState(initialLikes);

  const { data: isLikedFromAPI, isLoading } = usePostLiked(postId);
  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();

  useEffect(() => {
    if (!isLoading && typeof isLikedFromAPI === "boolean" && !initialLiked) {
      setIsLiked(isLikedFromAPI);
    }
  }, [isLikedFromAPI, isLoading, initialLiked]);

  const handleLikeToggle = () => {
    if (isLiked) {
      unlikePost(
        { postId },
        {
          onSuccess: (data) => {
            // console.log();
            setIsLiked(false);
            setLikeCount((pre) => (data.liked ? pre : pre - 1));
          },
        }
      );
    } else {
      // Like the post
      likePost(
        { postId },
        {
          onSuccess: (data) => {
            setIsLiked(true);
            setLikeCount((pre) => (data.liked ? pre + 1 : pre));
          },
        }
      );
    }
  };

  return (
    <IconText
      containerProps={{
        cursor: "pointer",
        onClick: handleLikeToggle,
        css: {
          "& svg": {
            color: isLiked ? "#e92145" : "star.600",
          },
        },
      }}
      icon="iconamoon:heart-fill"
      text={String(likeCount)}
    />
  );
};

export default PostLike;
