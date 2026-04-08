import {
  Box,
  Button,
  CheckboxGroup,
  Flex,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useUserNotifications } from "@/context/user-notifications.provider";
import { NotificationType } from "@/typings/INotification";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseTrigger,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.LIKE]: "Likes",
  [NotificationType.COMMENT]: "Comments",
  [NotificationType.NEW_MEMBER]: "New Members",
  [NotificationType.UPGRADE]: "Membership Upgrades",
  [NotificationType.DOWNGRADE]: "Membership Downgrades",
  [NotificationType.CANCELLATION]: "Membership Cancellations",
  [NotificationType.CHAT_MESSAGE]: "Chat Message",
  [NotificationType.GROUP_CHAT_CREATED]: "Group chat",
  [NotificationType.DIRECT_CHAT_CREATED]: "Direct chat created",
  [NotificationType.DIRECT_MESSAGE]: "Direct message",
  [NotificationType.COMMENT_REPLY]: "Comment reply",
  [NotificationType.NEW_POST]: "New post",
};

const FilterPopover: React.FC = () => {
  const { refetchNotifications } = useUserNotifications();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleApplyFilter = () => {
    refetchNotifications({
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
    });
  };

  const handleClearFilter = () => {
    setSelectedTypes([]);
    refetchNotifications({
      type: undefined,
    });
  };

  return (
    <PopoverRoot>
      <PopoverTrigger>
        <Button
          as={"div"}
          // icon={<Filter size={18} />}
          variant="ghost"
          size="sm"
        >
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent w="300px">
        <PopoverArrow />
        <PopoverCloseTrigger />
        <PopoverHeader fontWeight="semibold">
          Filter notifications
        </PopoverHeader>
        <PopoverBody>
          <Text mb={4} fontSize="sm" color="gray.600">
            Notification types
          </Text>
          <Box overflow="auto" maxH="200px">
            <CheckboxGroup
              colorScheme="blue"
              value={selectedTypes}
              onChange={(values) =>
                setSelectedTypes(values as unknown as string[])
              }
            >
              <Stack>
                {Object.entries(notificationTypeLabels).map(([type, label]) => (
                  <Checkbox key={type} value={type}>
                    {label}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </Box>
        </PopoverBody>
        <PopoverFooter>
          <Flex justifyContent="space-between">
            <Button size="sm" variant="ghost" onClick={handleClearFilter}>
              Clear
            </Button>
            <Button size="sm" colorScheme="blue" onClick={handleApplyFilter}>
              Apply
            </Button>
          </Flex>
        </PopoverFooter>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default FilterPopover;
