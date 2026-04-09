import React from "react";
import { Stack, Flex, Text, Icon } from "@chakra-ui/react";
import { FiPaperclip } from "react-icons/fi";

export interface Attachment {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  _id: string;
}

interface AttachmentsProps {
  attachments: Attachment[];
}

const Attachments: React.FC<AttachmentsProps> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleAttachmentClick = (attachment: Attachment) => {
    if (attachment.fileType.startsWith("image/")) {
      window.open(attachment.url, "_blank", "noopener,noreferrer");
    } else {
      const link = document.createElement("a");
      link.href = attachment.url;
      link.setAttribute("download", attachment.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Stack gap={2} mt={4} borderTop="1px" css={{ borderColor: "hsl(210, 30%, 88%)" }} pt={4}>
      <Text fontWeight="bold" fontSize="md" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
        Attachments
      </Text>
      {attachments.map((attachment) => (
        <Flex
          key={attachment._id}
          align="center"
          p={2}
          borderRadius="md"
          _hover={{ bg: "rgba(255,255,255,0.6)", cursor: "pointer" }}
          onClick={() => handleAttachmentClick(attachment)}
          as="button"
          textAlign="left"
          w="full"
          transition="background-color 0.2s"
        >
          <Icon as={FiPaperclip} mr={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} boxSize={5} />
          <Text
            fontSize="sm"
            css={{ color: "hsl(211, 71%, 43%)" }}
            _hover={{ textDecoration: "underline" }}
          >
            {attachment.fileName}
          </Text>
        </Flex>
      ))}
    </Stack>
  );
};

export default Attachments;
