"use client";
import IconText from "@/components/ui/icon-text";
import { useAuth } from "@/context/auth.provider";
import {
  useLikePost,
  useUnlikePost,
  usePostLiked,
} from "@/lib/backend-services/post-service";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface PostLikeProps {
  likes: number;
  liked?: boolean;
  postId?: string;
}

const PostLike: React.FC<PostLikeProps> = ({
  likes: initialLikes,
  liked: initialLiked,
  postId,
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked || false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const { user } = useAuth();
  const router = useRouter();

  const { data: isLikedFromAPI, isLoading } = usePostLiked(postId || "");
  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();

  useEffect(() => {
    if (!isLoading && typeof isLikedFromAPI === "boolean" && !initialLiked) {
      setIsLiked(isLikedFromAPI);
    }
  }, [isLikedFromAPI, isLoading, initialLiked]);

  const handleLikeToggle = () => {
    if (!postId) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (isLiked) {
      setIsLiked(false);
      setLikeCount((pre) => Math.max(pre - 1, 0));
      unlikePost(
        { postId },
        {
          onSuccess: () => {
            // setIsLiked(false);
            // if (data.pagination && typeof data.pagination.total === "number") {
            //   setLikeCount(data.pagination.total);
            // } else if (typeof data.likesCount === "number") {
            //   setLikeCount(data.likesCount);
            // } else {
            //   setLikeCount((prev) => Math.max(0, prev - 1));
            // }
          },
        }
      );
    } else {
      setIsLiked(true);
      setLikeCount((pre) => pre + 1);
      likePost(
        { postId }
        // {
        //   onSuccess: (data) => {
        //     setIsLiked(true);

        //     if (data.pagination && typeof data.pagination.total === "number") {
        //       setLikeCount(data.pagination.total);
        //     } else if (typeof data.likesCount === "number") {
        //       setLikeCount(data.likesCount);
        //     } else {
        //       setLikeCount((prev) => prev + 1);
        //     }
        //   },
        // }
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
