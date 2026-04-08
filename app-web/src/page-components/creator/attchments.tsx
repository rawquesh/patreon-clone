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
    <Stack gap={2} mt={4} borderTop="1px" borderColor="gray.200" pt={4}>
      <Text fontWeight="bold" fontSize="md" color="gray.700">
        Attachments
      </Text>
      {attachments.map((attachment) => (
        <Flex
          key={attachment._id}
          align="center"
          p={2}
          borderRadius="md"
          _hover={{ bg: "gray.100", cursor: "pointer" }}
          onClick={() => handleAttachmentClick(attachment)}
          as="button"
          textAlign="left"
          w="full"
          transition="background-color 0.2s"
        >
          <Icon as={FiPaperclip} mr={3} color="gray.500" boxSize={5} />
          <Text
            fontSize="sm"
            color="blue.600"
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
