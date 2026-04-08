/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth.provider";
import { User } from "@/typings/IUser";

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  subscriptionEmails: boolean;
  marketingEmails: boolean;
  darkMode: boolean;
}

/**
 * Hook to get the current user's data from auth context
 */
export const useUser = () => {
  // Get user from auth context
  const { user, isLoadingUser } = useAuth();

  return {
    data: user || null,
    isLoading: isLoadingUser,
  };
};

/**
 * Hook to get the current user's preferences
 */
export const useUserPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      try {
        // Check if user exists first
        if (!user) throw new Error("User not authenticated");

        const { data } = await api.get<UserPreferences>("/users/preferences");
        return data;
      } catch (error) {
        // Return default preferences if error occurs
        return {
          emailNotifications: true,
          pushNotifications: true,
          subscriptionEmails: true,
          marketingEmails: false,
          darkMode: false,
        } as UserPreferences;
      }
    },
    enabled: !!user, // Only run if user exists
  });
};

/**
 * Hook to update the current user's profile
 */
export const useUpdateProfile = () => {
  const { updateProfile } = useAuth();
  return updateProfile;
};

/**
 * Hook to update user preferences
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      if (!user) throw new Error("User not authenticated");

      const { data } = await api.patch<UserPreferences>(
        "/users/preferences",
        preferences
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      toaster.create({
        title: "Preferences updated",
        description: "Your preferences have been successfully updated",
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: "Update failed",
        description:
          error.response?.data?.message || "Failed to update preferences",
        type: "destructive",
      });
    },
  });
};

/**
 * Hook to update profile photo
 */
export const useUpdateProfilePhoto = () => {
  const { updateProfilePhoto } = useAuth();
  return updateProfilePhoto;
};

// Server-side API functions for SSR (if needed)
// Note: For most cases, you should use the useAuth hook in client components

export const getUserProfile = async (token: string): Promise<User | null> => {
  if (!token) return null;

  try {
    const { data } = await api.get<User>("/auth/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const getUserPreferences = async (
  token: string
): Promise<UserPreferences> => {
  if (!token) {
    return {
      emailNotifications: true,
      pushNotifications: true,
      subscriptionEmails: true,
      marketingEmails: false,
      darkMode: false,
    };
  }

  try {
    const { data } = await api.get<UserPreferences>("/users/preferences", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return {
      emailNotifications: true,
      pushNotifications: true,
      subscriptionEmails: true,
      marketingEmails: false,
      darkMode: false,
    };
  }
};

export const updateUserProfile = async (
  token: string,
  userData: any
): Promise<User | null> => {
  if (!token) return null;

  try {
    const { data } = await api.put<User>("/users/profile", userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

export const updateUserPreferences = async (
  token: string,
  preferences: Partial<UserPreferences>
): Promise<UserPreferences | null> => {
  if (!token) return null;

  try {
    const { data } = await api.patch<UserPreferences>(
      "/users/preferences",
      preferences,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return null;
  }
};
