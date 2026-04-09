import { Button } from "@/components/ui/button";
import {
  Box,
  Flex,
  Grid,
  Image,
  Stack,
  Text,
  useDisclosure,
  CloseButton,
  NativeSelect,
  FieldLabel,
  Heading,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { CreateMembershipForm } from "@/components/forms/create-membership-form";
import { toaster } from "@/components/ui/toaster";

import {
  // Dialog,
  // DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  // DialogFooter,
  DialogRoot,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";

interface Membership {
  _id: string;
  name: string;
  monthlyRate: number;
  subscriberCount: number;
  description: string;
  isActive: boolean;
  coverImageUrl?: string;
  isFeatured?: boolean;
}

const MembershipPage: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure();
  const [editingTier, setEditingTier] = useState<Membership | null>(null);
  const queryClient = useQueryClient();

  const { data: membershipsData } = useQuery({
    queryKey: ["memberships"],
    queryFn: async () => {
      const { data } = await api.get<{
        memberships: Membership[];
        total: number;
        totalSubscribers: number;
        totalEarnings: number;
      }>("/memberships/creator");
      return data;
    },
  });

  const updateMembershipMutation = useMutation({
    mutationFn: async (variables: { id: string; formData: FormData }) => {
      const { id, formData } = variables;
      return api.put(`/memberships/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Membership tier updated successfully",
        type: "success",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      onClose();
      setEditingTier(null);
    },
    onError: (error: any) => {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update membership tier",
        type: "error",
        duration: 3000,
      });
    },
  });

  const setFeaturedMutation = useMutation({
    mutationFn: async (data: { membershipId: string; isFeatured: boolean }) => {
      const { membershipId, isFeatured } = data;
      return api.put(`/memberships/${membershipId}/featured`, { isFeatured });
    },
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Featured membership updated successfully",
        type: "success",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
    onError: (error: any) => {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to update featured membership",
        type: "error",
        duration: 3000,
      });
    },
  });

  const handleEditClick = (tier: Membership) => {
    setEditingTier(tier);
    onOpen();
  };

  const handleUpdateMembership = async (formData: FormData) => {
    if (!editingTier) return;
    updateMembershipMutation.mutate({ id: editingTier._id, formData });
  };

  const handleFeatureChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    if (selectedId) {
      setFeaturedMutation.mutate({
        membershipId: selectedId,
        isFeatured: true,
      });
    }
  };

  const featuredTierId = membershipsData?.memberships?.find(
    (tier) => tier.isFeatured
  )?._id;

  if (!(membershipsData?.memberships || []).length) {
    return (
      <Box
        boxShadow={"md"}
        w={{ base: "90%", lg: "984px" }}
        borderRadius={"6px"}
        mx={"auto"}
        p={"24px"}
        pb={"100px"}
        // border={"2px solid red"}
      >
        <Flex
          alignItems={"center"}
          direction={{ base: "column-reverse", lg: "row" }}
          justifyContent={"space-between"}
        >
          <Stack>
            <Text fontSize={"2xl"} fontWeight={600}>
              Build your paid membership
            </Text>
            <Grid mt={3} gap={4} templateColumns={"auto 1fr"}>
              <Icon width={"24px"} icon={"mage:dollar-fill"} />
              <Stack gap={0} maxW={"284px"}>
                <Text fontSize={"sm"} fontWeight={600}>
                  Income you can count on
                </Text>
                <Text fontSize={"sm"}>
                  Earn recurring income from your biggest fans.
                </Text>
              </Stack>
            </Grid>
            <Grid mt={3} gap={4} templateColumns={"auto 1fr"}>
              <Icon width={"24px"} icon={"lets-icons:check-fill"} />
              <Stack gap={0} maxW={"284px"}>
                <Text fontSize={"sm"} fontWeight={600}>
                  Start with what you have
                </Text>
                <Text fontSize={"sm"}>
                  {
                    "Offer something you're already excited to share with your fans, plus some added perks."
                  }
                </Text>
              </Stack>
            </Grid>
            <Grid mt={3} gap={4} templateColumns={"auto 1fr"}>
              <Icon width={"24px"} icon={"raphael:barchart"} />
              <Stack gap={0} maxW={"284px"}>
                <Text fontSize={"sm"} fontWeight={600}>
                  Grow your creative business
                </Text>
                <Text fontSize={"sm"}>
                  Get insights on your members, create exclusive member-only
                  Chats, and more.
                </Text>
              </Stack>
            </Grid>
            <Link href="/profile/memberships/create">
              <Button mt={6} w={"fit"}>
                Get Started
              </Button>
            </Link>
          </Stack>
          <Image
            maxW={"380px"}
            alt="full tier image"
            src="/images/full_tier_img.png"
          />
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      w={{ base: "90%", lg: "984px" }}
      borderRadius={"6px"}
      mx={"auto"}
      p={"24px"}
      pb={"100px"}
    >
      <Heading fontSize={"2xl"} fontWeight={600} mb={6}>
        Paid membership tiers
      </Heading>

      {membershipsData && membershipsData.memberships.length > 0 && (
        <Field mb={6} maxW="sm">
          <FieldLabel>Featured Tier</FieldLabel>
          <NativeSelect.Root>
            <NativeSelect.Field
              defaultValue={featuredTierId || ""}
              onChange={handleFeatureChange}
              // disabled={setFeaturedMutation.isPending}
            >
              <option value="">Select a tier to feature...</option>
              {membershipsData.memberships.map((tier) => (
                <option key={tier._id} value={tier._id}>
                  {tier.name} (${tier.monthlyRate}/month)
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field>
      )}

      <Stack gap={4}>
        {(membershipsData?.memberships || []).map((tier) => (
          <Box key={tier._id} p={6} className="glass-card" borderRadius="lg" boxShadow="sm">
            <Flex justifyContent="space-between" alignItems="start">
              <Stack>
                <Text fontSize="xl" fontWeight="600">
                  {tier.name}
                </Text>
                <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                  ${tier.monthlyRate} / month · {tier.subscriberCount} members
                </Text>
              </Stack>
              <Button variant="ghost" onClick={() => handleEditClick(tier)}>
                Edit
              </Button>
            </Flex>
          </Box>
        ))}
      </Stack>
      <Link href="/profile/memberships/create">
        <ButtonWithIcon
          bg={"white"}
          icon={"mingcute:add-line"}
          variant="outline"
          mt={6}
        >
          Add a tier
        </ButtonWithIcon>
      </Link>

      {/* Edit Modal */}
      <DialogRoot open={open} size="xl">
        {/* <DialogTrigger asChild>
          <Button as={"div"}>Edit Membership Tier</Button>
        </DialogTrigger> */}
        <DialogContent className="glass-dialog-content">
          <DialogHeader>Edit Membership Tier</DialogHeader>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={onClose}
          />
          <DialogBody pb={6}>
            {editingTier && (
              <CreateMembershipForm
                initialData={editingTier}
                initialCoverImageUrl={editingTier.coverImageUrl}
                onSubmit={handleUpdateMembership}
                isLoading={updateMembershipMutation.isPending}
                submitButtonText="Save Changes"
                onCancel={onClose}
              />
            )}
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default MembershipPage;
