import {
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";

interface Props {
  username: string;
}

const SharePage: React.FC<Props> = ({ username }) => {
  const [copyMessage, setCopyMessage] = useState("");

  const getShareUrl = () => {
    return `${window.location.origin}/creator/${username}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(getShareUrl())
      .then(() => {
        setCopyMessage("Link copied!");
        setTimeout(() => setCopyMessage(""), 2000);
      })
      .catch(() => {
        setCopyMessage("Failed to copy link");
        setTimeout(() => setCopyMessage(""), 2000);
      });
  };

  const shareOnX = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`Check out this creator: ${username}`);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
    );
  };

  return (
    <PopoverRoot size={"xs"}>
      <PopoverTrigger>
        <IconButton variant={"ghost"} rounded={"999px"} as={"div"}>
          <Icon icon={"mingcute:upload-line"} />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent bg={"star.100"} w={"250px"} py={"12px"}>
        <PopoverHeader>
          <Text fontSize={"sm"} color={"star.500"}>
            Share this page
          </Text>
          {copyMessage && (
            <Text
              fontSize="xs"
              color={copyMessage.includes("Failed") ? "red.500" : "green.500"}
              mt={1}
            >
              {copyMessage}
            </Text>
          )}
        </PopoverHeader>
        <PopoverBody>
          <Flex
            cursor={"pointer"}
            _hover={{
              bg: "star.200",
            }}
            px={2}
            rounded={"8px"}
            py={2}
            gap={3}
            fontSize={"md"}
            color={"desert.700"}
            onClick={copyToClipboard}
          >
            <Icon icon={"line-md:link"} />
            <Text transform={"translateY(-2px)"}>Copy link</Text>
          </Flex>

          <Flex
            cursor={"pointer"}
            _hover={{
              bg: "star.200",
            }}
            px={2}
            rounded={"8px"}
            py={2}
            gap={3}
            fontSize={"md"}
            color={"desert.700"}
            onClick={shareOnX}
          >
            <Icon icon={"line-md:twitter-x"} />
            <Text transform={"translateY(-2px)"}>Share on X</Text>
          </Flex>

          <Flex
            cursor={"pointer"}
            _hover={{
              bg: "star.200",
            }}
            px={2}
            rounded={"8px"}
            py={2}
            gap={3}
            fontSize={"md"}
            color={"desert.700"}
            onClick={shareOnFacebook}
          >
            <Icon icon={"line-md:facebook"} />
            <Text transform={"translateY(-2px)"}>Share on facebook</Text>
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default SharePage;
