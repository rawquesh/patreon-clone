"use client";
import React, { useCallback, useEffect, useState } from "react";
import { VStack, Text, Flex, Switch } from "@chakra-ui/react";
import api from "@/lib/api";
import { ApiEndpoints } from "@/lib/backend-services/api_endpoints";

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
    const res = await api.get(ApiEndpoints.notificationsSettings);
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

    const res = await api.put(ApiEndpoints.notificationSettingsCreator, {
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
    });
    setLoading(false);
  };

  return (
    <VStack
      align="stretch"
      gap={4}
      className="glass-card"
      p={6}
      borderRadius="16px"
      w="full"
      maxW="800px"
    >
      {Object.entries(settings).map(([key, value]) => (
        <Flex
          key={key}
          justify="space-between"
          align="center"
          py={1}
        >
          <Text css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            {value.title}
          </Text>
          <Switch.Root
            disabled={loading}
            checked={value.enabled}
            onClick={() => handleToggle(key, !value.enabled)}
            css={{
              "& [data-checked]": {
                background: "var(--gradient-primary) !important",
              },
            }}
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
