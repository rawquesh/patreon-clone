import { useEffect, useRef, useState } from "react";
import {
  useLikeComment,
  useUnlikeComment,
  useAddComment,
  useEditComment,
  useDeleteComment,
} from "@/lib/backend-services/post-service";
import Comment from ".";
import { Box, Flex, Input } from "@chakra-ui/react";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";

interface Comment {
  id: string;
  user: {
    avatar: string;
    username: string;
  };
  timeStamp: string;
  comment: string;
  likes: number;
  liked: boolean;
  likedByCreator?: boolean;
  ownsComment: boolean;
  parentComment: string | null;
}

export const useCommentHandlers = (initialCommnets: Comment[] = []) => {
  const [comments, setComments] = useState<Comment[]>(initialCommnets);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(
    null
  );
  const { mutate: likeComment } = useLikeComment();
  const { mutate: unlikeComment } = useUnlikeComment();
  const { mutate: addComment } = useAddComment();
  const { mutate: editComment } = useEditComment();
  const { mutate: deleteComment } = useDeleteComment();

  const handleLike = async (commentId: string) => {
    if (!currentPostId) return;

    try {
      const comment = comments.find((c) => c.id === commentId);

      if (!comment) return;

      // Optimistically update UI
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            };
          }
          return comment;
        })
      );

      // Call API
      if (comment.liked) {
        unlikeComment({
          postId: currentPostId,
          commentId,
        });
      } else {
        likeComment({
          postId: currentPostId,
          commentId,
        });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleReply = (commentId: string | null, username: string) => {
    setReplyingTo(commentId);
    setReplyingToUsername(username);
    setEditingComment(null);
  };

  const submitReply = async (parentId: string, replyText: string) => {
    if (!currentPostId) return;

    try {
      // Call API
      addComment({
        postId: currentPostId,
        content: replyText,
        parentId,
      });

      // Close reply input
      setReplyingTo(null);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleEdit = (commentId: string | null) => {
    setEditingComment(commentId);
    setReplyingTo(null);
  };

  const submitEdit = async (commentId: string, newText: string) => {
    if (!currentPostId) return;

    try {
      // Update UI optimistically
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              comment: newText,
              timeStamp: "Edited just now",
            };
          }
          return comment;
        })
      );

      // Call API
      editComment({
        postId: currentPostId,
        commentId,
        content: newText,
      });

      // Close edit input
      setEditingComment(null);
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!currentPostId) return;

    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this comment?"
      );
      if (!confirmed) return;

      // Update UI optimistically
      setComments((prevComments) =>
        prevComments.filter(
          (comment) =>
            comment.id !== commentId && comment.parentComment !== commentId
        )
      );

      // Call API
      deleteComment({
        postId: currentPostId,
        commentId,
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleReport = async () => {
    try {
      alert(
        "Comment has been reported. Thank you for helping keep the community safe."
      );
    } catch (error) {
      console.error("Error reporting comment:", error);
    }
  };

  return {
    comments,
    setComments,
    replyingTo,
    editingComment,
    setCurrentPostId,
    setReplyingTo,
    setEditingComment,
    replyingToUsername,
    setReplyingToUsername,
    handlers: {
      handleLike,
      handleReply,
      submitReply,
      handleEdit,
      submitEdit,
      handleDelete,
      handleReport,
    },
  };
};

interface InputProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  initialValue?: string;
  avatarUrl: string;
}

export const EditInput: React.FC<InputProps> = ({
  onSubmit,
  onCancel,
  initialValue = "",
  avatarUrl,
}) => {
  const [text, setText] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.setSelectionRange(0, initialValue.length);
  }, [initialValue]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  return (
    <Flex gap={3} alignItems="flex-start">
      <Avatar src={avatarUrl} size="sm" />
      <Box flex="1">
        <Box borderWidth="1px" borderRadius="2xl" overflow="hidden" className="glass-input">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Edit your comment"
            border="none"
            _focus={{ border: "none", boxShadow: "none" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") {
                onCancel();
              }
            }}
          />
        </Box>
        <Flex justify="space-between" mt={2}>
          <Button variant="ghost" size="sm" onClick={onCancel} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            Cancel
          </Button>
          <Button
            variant="solid"
            size="sm"
            onClick={handleSubmit}
            className="btn-gradient"
            disabled={!text.trim()}
          >
            Save
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export const ReplyInput: React.FC<InputProps & { replyingTo: string }> = ({
  onSubmit,
  onCancel,
  avatarUrl,
  replyingTo,
}) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
    }
  };

  return (
    <Flex gap={3} alignItems="flex-start">
      <Avatar src={avatarUrl} size="sm" />
      <Box flex="1">
        <Box borderWidth="1px" borderRadius="2xl" overflow="hidden" className="glass-input">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Replying to ${replyingTo}`}
            border="none"
            _focus={{ border: "none", boxShadow: "none" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") {
                onCancel();
              }
            }}
          />
        </Box>
        <Flex justify="flex-start" mt={2}>
          <Button variant="ghost" size="sm" onClick={onCancel} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            Cancel
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};
