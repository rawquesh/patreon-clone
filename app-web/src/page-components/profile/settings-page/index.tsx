"use client";

import {
  Box,
  Text,
  Stack,
  NativeSelect,
  Button,
  Input,
  FieldLabel,
  useDisclosure,
  Heading,
} from "@chakra-ui/react";
import React, { useState } from "react";
import NotificationSettings from "./notifications-settings";
import { useAuth } from "@/context/auth.provider";
import {
  DialogRoot,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import { Field } from "@/components/ui/field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { CreatorCategory, ContentVisibility } from "@/typings/IUser";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    open: isPasswordDialogOpen,
    onOpen: onPasswordDialogOpen,
    onClose: onPasswordDialogClose,
  } = useDisclosure();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  const updateContentVisibility = useMutation({
    mutationFn: async (newVisibility: ContentVisibility) => {
      await api.put("/users/creator/content-visibility", {
        contentVisibleTo: newVisibility,
      });
    },
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Content visibility updated successfully.",
        type: "success",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to update content visibility.",
        type: "error",
        duration: 3000,
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async (newCategory: CreatorCategory) => {
      await api.put("/users/creator/category", { category: newCategory });
    },
    onMutate: () => {
      setIsUpdatingCategory(true);
    },
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Creator category updated successfully.",
        type: "success",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update creator category.",
        type: "error",
        duration: 3000,
      });
    },
    onSettled: () => {
      setIsUpdatingCategory(false);
    },
  });

  const handleVisibilityChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newValue = event.target.value as ContentVisibility;
    updateContentVisibility.mutate(newValue);
  };

  const handleCategoryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newCategory = event.target.value as CreatorCategory;
    updateCategory.mutate(newCategory);
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (passwords: any) => {
      await api.post("/users/reset-password", passwords);
    },
    onMutate: () => {
      setIsChangingPassword(true);
    },
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Password changed successfully.",
        type: "success",
        duration: 3000,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onPasswordDialogClose();
    },
    onError: (error: any) => {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change password.",
        type: "error",
        duration: 3000,
      });
    },
    onSettled: () => {
      setIsChangingPassword(false);
    },
  });

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toaster.create({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toaster.create({
        title: "Password Mismatch",
        description: "New password and confirmation password do not match.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: oldPassword,
      newPassword,
      confirmPassword,
    });
  };

  console.log(user);

  return (
    <Box pt={"56px"} maxW={"648px"} pb={"56px"} w={"90vw"} mx={"auto"}>
      <Heading
        mb={6}
        fontSize={"xl"}
        fontWeight={600}
        css={{
          background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Settings
      </Heading>

      <Stack mb={6} className="glass-card" borderRadius="16px" p={6} gap={2}>
        <Text fontSize={"sm"} fontWeight={600} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
          Account
        </Text>
        <Field>
          <FieldLabel
            fontSize="sm"
            css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
          >
            Content Visibility
          </FieldLabel>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={user?.contentVisibleTo || ContentVisibility.BOTH}
              onChange={handleVisibilityChange}
              placeholder="Select content visibility"
              className="glass-input"
              css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}
            >
              <option value={ContentVisibility.BOTH}>
                Everyone - Visible to all users
              </option>
              <option value={ContentVisibility.MALE}>
                Male Only - Only visible to male users
              </option>
              <option value={ContentVisibility.FEMALE}>
                Female Only - Only visible to female users
              </option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field>

        <Field>
          <FieldLabel
            fontSize="sm"
            css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
          >
            Creator Category
          </FieldLabel>
          <NativeSelect.Root disabled={isUpdatingCategory}>
            <NativeSelect.Field
              value={user?.creatorCategory || ""}
              onChange={handleCategoryChange}
              placeholder="Select your creator category"
              className="glass-input"
              css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}
            >
              {Object.values(CreatorCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Field>

        <DialogRoot
          open={isPasswordDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              onClick={onPasswordDialogOpen}
              variant="outline"
              size="sm"
              mt={2}
              w="fit-content"
              className="glass-card"
              css={{
                fontWeight: 600,
                color: "hsl(211, 71%, 43%)",
                borderColor: "hsl(211, 71%, 43% / 0.3)",
                "&:hover": {
                  background: "var(--gradient-primary)",
                  color: "white",
                  borderColor: "transparent",
                },
              }}
            >
              Change Password
            </Button>
          </DialogTrigger>

          <DialogContent
            className="glass-dialog-content"
            px={6}
            py={4}
            css={{ borderRadius: "20px" }}
          >
            <DialogHeader>
              <DialogTitle css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                Change Password
              </DialogTitle>
              <DialogCloseTrigger onClick={onPasswordDialogClose} />
            </DialogHeader>
            <Stack gap={4} py={4}>
              <Field required>
                <FieldLabel fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                  Old Password
                </FieldLabel>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="glass-input"
                  css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}
                />
              </Field>
              <Field required>
                <FieldLabel fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                  New Password
                </FieldLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="glass-input"
                  css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}
                />
              </Field>
              <Field required>
                <FieldLabel fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                  Confirm New Password
                </FieldLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="glass-input"
                  css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}
                />
              </Field>
            </Stack>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={onPasswordDialogClose}
                className="glass-card"
                css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                loading={isChangingPassword}
                className="btn-gradient"
                css={{ fontWeight: 600 }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </Stack>

      <Text mb={2} fontSize={"sm"} fontWeight={600} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
        Notifications
      </Text>
      <NotificationSettings />
    </Box>
  );
};

export default SettingsPage;
