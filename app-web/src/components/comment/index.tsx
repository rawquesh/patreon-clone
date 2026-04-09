import React from "react";
import { Flex, Text, IconButton, Box } from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { Icon } from "@iconify/react/dist/iconify.js";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { Avatar } from "@/components/ui/avatar";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { branding } from "@/config/branding";

interface Props {
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
  onLike: () => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  commentId: string;
  bg?: "star" | "white";
}

const Comment: React.FC<Props> = ({
  user,
  timeStamp,
  comment,
  likes,
  liked,
  likedByCreator,
  ownsComment,
  parentComment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onReport,
  commentId,
  bg = "star",
}) => {
  // const handleMenuAction = (value: string) => {
  //   switch (value) {
  //     case "edit":
  //       onEdit?.();
  //       break;
  //     case "delete":
  //       onDelete?.();
  //       break;
  //     case "report":
  //       onReport?.();
  //       break;
  //   }
  // };

  return (
    <Box pl={parentComment ? "48px" : "0"} position="relative">
      {parentComment && (
        <Box
          position="absolute"
          left="24px"
          top="0"
          bottom="0"
          width="1px"
          css={{ background: "hsl(210, 30%, 88%)" }}
          data-comment-connector={`${parentComment}-${commentId}`}
        />
      )}

      <Flex gap={3} alignItems="flex-start">
        <Avatar src={user.avatar} size="sm" />

        <Box flex="1">
          <Flex
            css={{
              background: bg === "star"
                ? "linear-gradient(135deg, hsl(211, 71%, 43% / 0.06), hsl(335, 27%, 64% / 0.04))"
                : "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
            py={"12px"}
            px={"16px"}
            borderRadius="2xl"
            direction="column"
          >
            <Flex justify="space-between" align="center">
              <Flex gap={2} align="center">
                <Text fontWeight="semibold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                  {user.username}
                </Text>
                <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} fontSize="sm">
                  {getTimeAgo(timeStamp)}
                </Text>
              </Flex>

              <MenuRoot>
                <MenuTrigger>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    as="div"
                    aria-label="More options"
                  >
                    <Icon icon="solar:menu-dots-bold" />
                  </IconButton>
                </MenuTrigger>
                <MenuContent>
                  {ownsComment ? (
                    <>
                      <MenuItem onClick={onEdit} value="edit">
                        Edit
                      </MenuItem>
                      <MenuItem onClick={onDelete} value="delete">
                        Delete
                      </MenuItem>
                    </>
                  ) : (
                    <MenuItem onClick={onReport} value="report">
                      Report
                    </MenuItem>
                  )}
                </MenuContent>
              </MenuRoot>
            </Flex>

            {/* Comment Text */}
            <Text css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{comment}</Text>
          </Flex>

          {/* Actions */}
          <Flex gap={2} mt={2} align="center">
            <ButtonWithIcon
              variant="ghost"
              size="sm"
              icon={liked ? "iconamoon:heart-fill" : "iconamoon:heart"}
              color={liked ? branding.colors.like : "hsl(215.4, 16.3%, 46.9%)"}
              iconProps={{
                height: "30px",
                fontSize: "30px",
              }}
              textProps={{
                fontSize: "sm",
              }}
              gap={0}
              px={0}
              onClick={onLike}
              aria-label={liked ? "Unlike" : "Like"}
            >
              {likes > 0 && likes}
            </ButtonWithIcon>
            {!parentComment && (
              <ButtonWithIcon
                variant="ghost"
                size="sm"
                icon="tabler:arrow-forward"
                css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
                _hover={{ bg: "transparent", color: "hsl(222.2, 47.4%, 11.2%)" }}
                px={0}
                onClick={onReply}
                aria-label="Reply"
              >
                Reply
              </ButtonWithIcon>
            )}

            {likedByCreator && (
              <Flex
                align="center"
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  borderRadius: "9999px",
                  px: 2,
                  py: 0.5,
                }}
              >
                <Text fontSize="xs" css={{ color: "white" }}>
                  R
                </Text>
                <Box as="span" css={{ color: "white" }} ml={0.5} fontSize="xs">
                  ♥
                </Box>
              </Flex>
            )}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default Comment;
