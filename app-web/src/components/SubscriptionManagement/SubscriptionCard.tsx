import React from "react";
import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Badge,
  Image,
  useDisclosure,
  Menu,
} from "@chakra-ui/react";
import { Separator } from "@chakra-ui/react";
import { MoreVertical } from "lucide-react";
import { ISubscription, SubscriptionStatus } from "@/typings/ISubscription";
import { useCancelSubscription } from "@/lib/backend-services/subscription-service";
import { useRouter } from "next/navigation";
import {
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface SubscriptionCardProps {
  subscription: ISubscription;
  onCancelled?: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onCancelled,
}) => {
  const router = useRouter();
  const cancelMutation = useCancelSubscription();
  const {
    open: isCancelDialogOpen,
    onOpen: openCancelDialog,
    onClose: closeCancelDialog,
  } = useDisclosure();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCancel = () => {
    cancelMutation.mutate(subscription._id, {
      onSuccess: () => {
        closeCancelDialog();
        if (onCancelled) {
          onCancelled();
        }
      },
    });
  };

  const handleViewCreator = () => {
    router.push(`/creator/${subscription.creator._id}`);
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return "green";
      case "cancelled":
        return "orange";
      case "expired":
        return "red";
      default:
        return "gray";
    }
  };

  const isActive = subscription.status === SubscriptionStatus.ACTIVE;
  const membershipName = subscription.membership.name;
  const creatorName = subscription.creator.displayName;
  const creatorImage =
    subscription.creator.profilePicture || "/images/default-avatar.jpg";
  const coverImage =
    subscription.membership.coverImage || "/images/default-membership.jpg";

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        transition="transform 0.2s"
        _hover={{ transform: "translateY(-4px)", boxShadow: "md" }}
      >
        {/* Subscription Header */}
        <Box position="relative">
          {/* Cover Image */}
          <Box
            height="120px"
            bg="gray.100"
            backgroundImage={`url(${coverImage})`}
            backgroundSize="cover"
            backgroundPosition="center"
          />

          {/* Status Badge */}
          <Badge
            position="absolute"
            top="8px"
            right="8px"
            borderRadius="full"
            px="2"
            colorScheme={getStatusColor(
              subscription.status as SubscriptionStatus
            )}
          >
            {subscription.status}
          </Badge>

          {/* Subscription Actions */}
          <Box position="absolute" top="8px" left="8px">
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  colorScheme="blackAlpha"
                  borderRadius="full"
                  minW="initial"
                  p={1}
                >
                  <MoreVertical size={16} />
                </Button>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="view-creator" onClick={handleViewCreator}>
                    View Creator Page
                  </Menu.Item>
                  {isActive && (
                    <Menu.Item
                      value="cancel-subscription"
                      onClick={openCancelDialog}
                      color="red.500"
                    >
                      Cancel Subscription
                    </Menu.Item>
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </Box>
        </Box>

        {/* Subscription Info */}
        <Box p={4}>
          <Stack gap={2}>
            {/* Creator Image and Name */}
            <Flex align="center" mb={2}>
              <Image
                boxSize="40px"
                borderRadius="full"
                src={creatorImage}
                alt={creatorName}
                mr={2}
              />
              <Box>
                <Text fontWeight="medium" fontSize="sm">
                  {creatorName}
                </Text>
              </Box>
            </Flex>

            <Heading size="md">{membershipName}</Heading>

            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              ${subscription.monthlyRate}/month
            </Text>

            <Separator />

            {/* Dates */}
            <Flex justifyContent="space-between">
              <Text fontSize="sm" color="gray.600">
                Started:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {formatDate(subscription.currentPeriodStart)}
              </Text>
            </Flex>

            {isActive && (
              <Flex justifyContent="space-between">
                <Text fontSize="sm" color="gray.600">
                  Next billing:
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formatDate(subscription.currentPeriodEnd)}
                </Text>
              </Flex>
            )}

            {/* {subscription.canceledAt && (
              <Flex justifyContent="space-between">
                <Text fontSize="sm" color="gray.600">
                  Cancelled:
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formatDate(subscription.canceledAt)}
                </Text>
              </Flex>
            )} */}
          </Stack>

          {/* Actions */}
          {isActive && (
            <Button
              mt={4}
              w="full"
              variant="outline"
              onClick={handleViewCreator}
            >
              Go to Content
            </Button>
          )}
        </Box>
      </Box>

      {/* Cancel Confirmation Dialog */}
      <DialogRoot open={isCancelDialogOpen}>
        <DialogBackdrop />
        {/* <DialogPositioner> */}
        <DialogContent>
          <DialogHeader>Cancel Subscription</DialogHeader>
          {/* <DialogCloseButton /> */}
          <DialogBody>
            <Text>
              Are you sure you want to cancel your subscription to &ldquo;
              {membershipName}&rdquo;?
            </Text>
            <Text mt={2} fontWeight="medium">
              You will still have access until{" "}
              {formatDate(subscription.currentPeriodEnd)}.
            </Text>
          </DialogBody>

          <DialogFooter>
            <Button variant="ghost" mr={3} onClick={closeCancelDialog}>
              Keep Subscription
            </Button>
            <Button
              colorScheme="red"
              onClick={handleCancel}
              loading={cancelMutation.isPending}
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
        {/* </DialogPositioner> */}
      </DialogRoot>
    </>
  );
};

export default SubscriptionCard;
