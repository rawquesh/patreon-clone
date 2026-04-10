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
import { IComment } from "@/typings/IComment";

interface PostCommentsSectionProps {
  bg?: "star" | "white";
  postId: string;
  className?: string;
}

const PostCommentsSection: React.FC<PostCommentsSectionProps> = ({
  bg = "star",
  postId,
  className,
}) => {
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  const { data: commentsData, isLoading, isError } = usePostComments(postId);
  const { mutate: addComment } = useAddComment();

  const {
    comments,
    replyingTo,
    editingComment,
    handlers,
    setComments,
    setCurrentPostId,
    replyingToUsername,
  } = useCommentHandlers([]);

  useEffect(() => {
    setCurrentPostId(postId);
  }, [postId, setCurrentPostId]);

  useEffect(() => {
    if (commentsData?.comments) {
      const formattedComments: IComment[] = commentsData.comments.map(
        (comment) => ({
          comment: comment.text,
          id: comment.id,
          liked: comment.isLiked,
          likes: comment.likesCount,
          ownsComment: comment.user.id === user?._id,
          parentComment: comment.parentId || null,
          timeStamp: comment.createdAt,
          user: {
            avatar:
              comment.user.profilePicture ||
              branding.assets.placeholderProfilePicture,
            username: comment.user.displayName || "Unknown User",
          },
        })
      );
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

  const renderComment = (comment: IComment) => (
    <Comment
      key={comment.id}
      bg={bg}
      {...comment}
      commentId={comment.id}
      onLike={() => handlers.handleLike(comment.id)}
      onReply={() => handlers.handleReply(comment.id, comment.user.username)}
      onEdit={() => handlers.handleEdit(comment.id)}
      onDelete={() => handlers.handleDelete(comment.id)}
      onReport={handlers.handleReport}
    />
  );

  if (!user) {
    return null;
  }

  return (
    <Box className={className}>
      <Separator my={4} />
      {comments
        .filter((comment) => !comment.parentComment)
        .map((comment) => (
          <React.Fragment key={comment.id}>
            {renderComment(comment)}
            {comments
              .filter((child) => child.parentComment === comment.id)
              .map((childComment) => renderComment(childComment))}
          </React.Fragment>
        ))}
      {replyingTo && (
        <ReplyInput
          replyingTo={replyingToUsername || ""}
          onSubmit={(text) => handlers.submitReply(replyingTo, text)}
          onCancel={() => {
            handlers.handleReply(null, "");
          }}
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
          onCancel={() => {
            handlers.handleEdit(null);
          }}
          avatarUrl={
            user?.profilePicture ||
            branding.assets.placeholderProfilePicture
          }
        />
      )}
      <Box borderWidth="1px" borderRadius="2xl" overflow="hidden" className="glass-input">
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
          }}
        />
      </Box>
    </Box>
  );
};

export default PostCommentsSection;
