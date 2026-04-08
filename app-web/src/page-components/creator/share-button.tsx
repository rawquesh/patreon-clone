import IconText from "@/components/ui/icon-text";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toaster } from "@/components/ui/toaster";

export const sharePageDialogActionList: {
  id: string;
  icon: string;
  text: string;
}[] = [
  {
    id: "copy",
    icon: "uil:link",
    text: "Copy link",
  },
  {
    id: "twitter",
    icon: "prime:twitter",
    text: "Share on Twitter",
  },
  {
    id: "facebook",
    icon: "lucide:facebook",
    text: "Share on Facebook",
  },
  {
    id: "instagram",
    icon: "lucide:instagram",
    text: "Share on Instagram",
  },
  {
    id: "tiktok",
    icon: "mingcute:tiktok-line",
    text: "Share on TikTok",
  },
];

export const ShareButton: React.FC<{ postId: string }> = ({ postId }) => {
  const handleShare = (id: string) => {
    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}/post/${postId}`;

    switch (id) {
      case "copy":
        navigator.clipboard
          .writeText(postUrl)
          .then(() => {
            toaster.create({
              title: "Link copied!",
              type: "success",
              duration: 2000,
            });
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
            toaster.create({
              title: "Failed to copy link",
              type: "error",
              duration: 2000,
            });
          });
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            postUrl
          )}`,
          "_blank"
        );
        break;
      case "instagram":
      case "tiktok":
        navigator.clipboard
          .writeText(postUrl)
          .then(() => {
            toaster.create({
              title: "Link copied!",
              description: `Sharing directly to ${id} is not supported from web. Please paste the link in the app.`,
              type: "info",
              duration: 5000,
            });
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
            toaster.create({
              title: "Failed to copy link",
              type: "error",
              duration: 2000,
            });
          });
        break;
      default:
        console.warn("Unknown share action:", id);
    }
  };

  return (
    <DialogRoot>
      <DialogTrigger>
        <IconText
          containerProps={{ cursor: "pointer" }}
          icon="formkit:share"
          asDiv
          text="Share"
          textProps={{
            fontSize: "sm",
            lineHeight: 1.8,
            ml: "1px",
          }}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Text fontSize={"xl"} fontWeight={600} flex={1} textAlign={"center"}>
            Share this post
          </Text>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <Stack>
            <Stack mt={"24px"}>
              {sharePageDialogActionList.map((action) => (
                <IconListItem
                  key={action.id}
                  {...action}
                  onClick={handleShare}
                />
              ))}
            </Stack>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

interface Props {
  id: string;
  icon: string;
  text: string;
  onClick: (id: string) => void;
}

const IconListItem: React.FC<Props> = ({ icon, text, id, onClick }) => {
  return (
    <Flex
      _hover={{
        bg: "star.100",
      }}
      py={2}
      px={2}
      gap={4}
      alignItems={"center"}
      cursor={"pointer"}
      onClick={() => onClick(id)}
    >
      <Icon width={"20px"} icon={icon} />
      <Text transform={"translateY(2px)"} fontWeight={600}>
        {text}
      </Text>
    </Flex>
  );
};
