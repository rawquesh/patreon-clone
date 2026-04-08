/**
 * Centralized toast notification handlers.
 * Services use these instead of calling toaster.create() directly,
 * keeping the data layer decoupled from UI concerns.
 */
import { toaster } from "@/components/ui/toaster";

/** Toast configuration for consistent styling */
const defaultToastOptions = {
  duration: 4000,
} as const;

export const toastHandlers = {
  // Comment actions
  commentAdded: () => {
    toaster.create({
      title: "Comment added",
      description: "Your comment has been posted",
      ...defaultToastOptions,
    });
  },
  commentUpdated: () => {
    toaster.create({
      title: "Comment updated",
      description: "Your comment has been updated",
      ...defaultToastOptions,
    });
  },
  commentDeleted: () => {
    toaster.create({
      title: "Comment deleted",
      description: "Your comment has been removed",
      ...defaultToastOptions,
    });
  },
  commentError: (message?: string) => {
    toaster.create({
      title: "Failed to add comment",
      description: message || "Could not post your comment",
      type: "destructive",
      ...defaultToastOptions,
    });
  },
  commentUpdateError: (message?: string) => {
    toaster.create({
      title: "Failed to update comment",
      description: message || "Could not update your comment",
      type: "destructive",
      ...defaultToastOptions,
    });
  },
  commentDeleteError: (message?: string) => {
    toaster.create({
      title: "Failed to delete comment",
      description: message || "Could not delete your comment",
      type: "destructive",
      ...defaultToastOptions,
    });
  },

  // Like actions
  likeError: (message?: string) => {
    toaster.create({
      title: "Failed to like post",
      description: message || "Could not like the post",
      type: "destructive",
      ...defaultToastOptions,
    });
  },
  unlikeError: (message?: string) => {
    toaster.create({
      title: "Failed to unlike post",
      description: message || "Could not unlike the post",
      type: "destructive",
      ...defaultToastOptions,
    });
  },
  commentLikeError: (message?: string) => {
    toaster.create({
      title: "Failed to like comment",
      description: message || "Could not like the comment",
      type: "destructive",
      ...defaultToastOptions,
    });
  },
  commentUnlikeError: (message?: string) => {
    toaster.create({
      title: "Failed to unlike comment",
      description: message || "Could not unlike the comment",
      type: "destructive",
      ...defaultToastOptions,
    });
  },

  // Generic
  genericError: (title: string, message?: string) => {
    toaster.create({
      title,
      description: message || "An error occurred",
      type: "destructive",
      ...defaultToastOptions,
    });
  },

  // Chat-specific
  chatFetchError: (action: string) => {
    toaster.create({
      title: "Error",
      description: `Failed to ${action}`,
      type: "error",
      duration: 3000,
    });
  },

  // Subscription-specific
  preferencesUpdated: () => {
    toaster.create({
      title: "Preferences updated",
      description: "Your preferences have been successfully updated",
      ...defaultToastOptions,
    });
  },
  subscriptionSuccess: () => {
    toaster.create({
      title: "Subscription successful",
      description: "You are now subscribed to this membership",
      ...defaultToastOptions,
    });
  },
  subscriptionError: (message?: string) => {
    toaster.create({
      title: "Subscription failed",
      description: message || "Failed to subscribe to membership",
      type: "destructive",
      ...defaultToastOptions,
    });
  },
  joinedSuccess: () => {
    toaster.create({
      title: "Joined successfully",
      description: "You are now a free member",
      ...defaultToastOptions,
    });
  },
  subscriptionCancelled: () => {
    toaster.create({
      title: "Subscription cancelled",
      description: "Your subscription has been cancelled",
      ...defaultToastOptions,
    });
  },
  cancellationError: (message?: string) => {
    toaster.create({
      title: "Cancellation failed",
      description: message || "Failed to cancel subscription",
      type: "destructive",
      ...defaultToastOptions,
    });
  },
  promotionRedeemed: (message?: string) => {
    toaster.create({
      title: "Promotion redeemed",
      description: message || "Promotion code redeemed successfully",
      ...defaultToastOptions,
    });
  },
  redemptionError: (message?: string) => {
    toaster.create({
      title: "Redemption failed",
      description: message || "Failed to redeem promotion code",
      type: "destructive",
      ...defaultToastOptions,
    });
  },
};

/**
 * Extract error message from an axios error.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const err = error as { response?: { data?: { message?: string } } };
    return err.response?.data?.message || fallback;
  }
  return fallback;
}
