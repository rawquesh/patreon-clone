"use client";
import Comment from "@/components/comment";
import { branding } from "@/config/branding";
import {
  EditInput,
  ReplyInput,
  useCommentHandlers,
} from "@/components/comment/useCommentHandlers";
import {
  usePostComments,
  useAddComment,
} from "@/lib/backend-services/post-service";
import { Box, Input, Separator, Spinner } from "@chakra-ui/react";
import { useAuth } from "@/context/auth.provider";
import React, { useState, useEffect } from "react";
// import Comment from "./comment";

interface PostCommentsSectionProps {
  bg?: "star" | "white";
  postId: string;
}

const PostCommentsSection: React.FC<PostCommentsSectionProps> = ({
  bg = "star",
  postId,
}) => {
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  const { data: commentsData, isLoading, isError } = usePostComments(postId);
  const { mutate: addComment } = useAddComment();

  const {
    comments,
    replyingTo,
    replyingToUsername,
    editingComment,
    handlers,
    setComments,
    setCurrentPostId,
  } = useCommentHandlers([]);

  // Set the current post ID for the comment handlers
  useEffect(() => {
    setCurrentPostId(postId);
  }, [postId, setCurrentPostId]);

  // Map API comments to the format expected by useCommentHandlers
  useEffect(() => {
    if (commentsData?.comments) {
      const formattedComments = [] as any;
      setComments(formattedComments);
    }
  }, [commentsData, user, setComments]);

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    addComment(
      {
        postId,
        content: commentText,
      },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={4}>
        Failed to load comments.
      </Box>
    );
  }

  return (
    <div>
      <Separator my={4} />
      {comments.map((comment) => (
        <Comment
          bg={bg}
          key={comment.id}
          {...comment}
          commentId={comment.id}
          onLike={() => handlers.handleLike(comment.id)}
          onReply={() =>
            handlers.handleReply(comment.id, comment.user.username)
          }
          onEdit={() => handlers.handleEdit(comment.id)}
          onDelete={() => handlers.handleDelete(comment.id)}
          onReport={() => handlers.handleReport()}
        />
      ))}

      {replyingTo && (
        <ReplyInput
          replyingTo={replyingToUsername || ""}
          onSubmit={(text) => handlers.submitReply(replyingTo, text)}
          onCancel={() => {}}
          avatarUrl={
            user?.profilePicture ||
            branding.assets.placeholderProfilePicture
          }
        />
      )}

      {editingComment && (
        <EditInput
          initialValue={
            comments.find((c) => c.id === editingComment)?.comment || ""
          }
          onSubmit={(text) => handlers.submitEdit(editingComment, text)}
          onCancel={() => {}}
          avatarUrl={
            user?.profilePicture ||
            branding.assets.placeholderProfilePicture
          }
        />
      )}
      <Box borderWidth="1px" borderRadius="2xl" overflow="hidden" bg="white">
        <Input
          placeholder="Join the conversation..."
          border="none"
          _focus={{ border: "none", boxShadow: "none" }}
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
            // if (e.key === "Escape") {
            // 	onCancel();
            // }
          }}
        />
      </Box>
    </div>
  );
};

export default PostCommentsSection;
