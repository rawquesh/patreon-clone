import axios from "axios";
import { branding } from "@/config/branding";

interface User {
  _id: string;
  email: string;
  displayName: string;
  role: "USER" | "CREATOR" | "ADMIN";
  onboardingCompleted?: boolean;
}

/**
 * Get the current user from the API using a temporary axios instance.
 * Does not mutate any shared state -- each call gets its own instance.
 */
export const getUser = async (token: string): Promise<User | null> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
      || `https://${branding.urls.apiServer}`;
    const response = await axios.get<User>(`${baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
