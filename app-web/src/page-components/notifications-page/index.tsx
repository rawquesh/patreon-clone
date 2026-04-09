"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Spinner,
  Center,
  Heading,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import NotificationsList from "./notifications-list";
import { useUserNotifications } from "@/context/user-notifications.provider";

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAllNotificationsAsRead,
    refetchNotifications,
  } = useUserNotifications();

  useEffect(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  return (
    <Box
      className="animate-fade-in-up"
      pt={"56px"}
      maxW={"648px"}
      w={"90vw"}
      mx={"auto"}
      pb="100px"
    >
      <Box mb={6} position="relative">
        <Box
          position="absolute"
          w="300px"
          h="60px"
          borderRadius="full"
          css={{
            background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.06))",
            filter: "blur(40px)",
            top: "-10px",
            left: "0",
            pointerEvents: "none",
          }}
        />
        <Flex justifyContent={"space-between"} alignItems={"center"} mb={4}>
          <Heading
            fontSize={"xl"}
            fontWeight={700}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </Heading>
          <Flex gap={3}>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsAsRead}
                css={{
                  color: "hsl(211, 71%, 43%)",
                  fontWeight: 500,
                  "&:hover": {
                    background: "rgba(29, 112, 191, 0.08)",
                    textDecoration: "underline",
                  },
                }}
              >
                Mark all as read
              </Button>
            )}
          </Flex>
        </Flex>
        <Box
          h="1px"
          background="linear-gradient(90deg, transparent, hsl(210, 30%, 88%), transparent)"
        />
      </Box>

      {isLoading && notifications.length === 0 ? (
        <Center py={10}>
          <Box
            w="48px"
            h="48px"
            borderRadius="full"
            border="3px solid hsl(210, 30%, 88%)"
            borderTopColor="hsl(211, 71%, 43%)"
            animation="spin 0.8s linear infinite"
            css={{
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
        </Center>
      ) : error ? (
        <Center py={10}>
          <Box
            className="glass-card"
            p={6}
            borderRadius="12px"
            textAlign="center"
          >
            <Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
              Error loading notifications
            </Text>
          </Box>
        </Center>
      ) : notifications.filter((n) => n.userMode !== "user").length === 0 ? (
        <Center py={10} flexDirection="column" gap={4}>
          <Box
            className="glass-card"
            p={8}
            borderRadius="16px"
            textAlign="center"
            maxW="360px"
            mx="auto"
          >
            <Box
              w="64px"
              h="64px"
              borderRadius="full"
              mx="auto"
              mb={4}
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.1), hsl(335, 27%, 64% / 0.08))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(215.4, 16.3%, 46.9%)" strokeWidth="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </Box>
            <Text
              fontSize="lg"
              fontWeight={600}
              css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
              mb={2}
            >
              No notifications yet
            </Text>
            <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontSize: "14px" }}>
              When you get notifications, they&apos;ll appear here
            </Text>
          </Box>
        </Center>
      ) : (
        <NotificationsList />
      )}
    </Box>
  );
};

export default NotificationsPage;
