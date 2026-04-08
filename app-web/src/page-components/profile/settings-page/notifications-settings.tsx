"use client";
import React, { useCallback, useEffect, useState } from "react";
import { VStack, Text, Flex, Switch } from "@chakra-ui/react";
import api from "@/lib/api";

// interface NotificationSetting {
//   id: string;
//   title: string;
//   subtitle?: string;
//   enabled: boolean;
// }

type NotificationSection = Record<string, { title: string; enabled: boolean }>;

const NotificationSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = React.useState<NotificationSection>({
    creatorNotifyOnNewMember: {
      title: "Notify on new member",
      enabled: false,
    },
    creatorNotifyOnComments: {
      title: "Notify on comments",
      enabled: false,
    },
    creatorNotifyOnDirectMessages: {
      title: "Notify on direct messages",
      enabled: false,
    },
  });

  const getNotificationSettings = useCallback(async () => {
    const res = await api.get("/notifications/settings");
    const {
      data: { creatorSettings },
    } = res;
    setSettings((pre) => {
      const newSettings = { ...pre };
      newSettings.creatorNotifyOnNewMember.enabled =
        creatorSettings.creatorNotifyOnNewMember;
      newSettings.creatorNotifyOnComments.enabled =
        creatorSettings.creatorNotifyOnComments;
      newSettings.creatorNotifyOnDirectMessages.enabled =
        creatorSettings.creatorNotifyOnDirectMessages;
      return newSettings;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    getNotificationSettings();
  }, [getNotificationSettings]);

  const handleToggle = async (settingId: string, on: boolean) => {
    console.clear();
    console.log(settingId, on);
    setLoading(true);

    const res = await api.put(`/notifications/settings/creator`, {
      [settingId]: !settings[settingId].enabled,
    });

    const { data: creatorSettings } = res;
    console.log(res);
    setSettings((pre) => {
      const newSettings = { ...pre };
      newSettings.creatorNotifyOnNewMember.enabled =
        creatorSettings.creatorNotifyOnNewMember;
      newSettings.creatorNotifyOnComments.enabled =
        creatorSettings.creatorNotifyOnComments;
      newSettings.creatorNotifyOnDirectMessages.enabled =
        creatorSettings.creatorNotifyOnDirectMessages;
      return newSettings;
      // console.log({ pre, newSettings });
      // return pre;
    });
    setLoading(false);
  };

  return (
    <VStack
      align="stretch"
      gap={8}
      bg="white"
      p={6}
      borderRadius="lg"
      w="full"
      maxW="800px"
    >
      {Object.entries(settings).map(([key, value]) => (
        <Flex key={key} justify="space-between" align="center" py={1}>
          <Text color="gray.700">{value.title}</Text>
          <Switch.Root
            disabled={loading}
            checked={value.enabled}
            onClick={() => handleToggle(key, !value.enabled)}
            // onChange={() => handleToggle(key, !value.enabled)}
            colorScheme="blue"
          >
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label />
          </Switch.Root>
        </Flex>
      ))}
    </VStack>
  );
};

export default NotificationSettings;
