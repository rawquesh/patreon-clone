import api from "./api";

interface User {
  _id: string;
  email: string;
  displayName: string;
  role: "USER" | "CREATOR" | "ADMIN";
  onboardingCompleted?: boolean;
}

/**
 * Get the current user from the API
 */
export const getUser = async (token: string): Promise<User | null> => {
  try {
    // Set the token in the API headers
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Fetch the user data
    const { data } = await api.get<User>("/auth/me");
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
