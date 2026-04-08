"use client";
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { setCookie, deleteCookie } from "cookies-next";
import { CreatorCategory, User } from "@/typings/IUser";
import { getUserMode } from "@/components/SideNav/user-avatar";
import { Gender } from "@/types/auth";

enum GenderPreference {
  MALE = "male",
  FEMALE = "female",
  BOTH = "both",
}

export interface UpdateProfileDto {
  displayName?: string;
  email?: string;
  countryOfResidence?: string;
  gender?: string;
  genderPreference?: GenderPreference;
}

const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
  setCookie("token", token, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
};

const clearAuthToken = () => {
  localStorage.removeItem("token");
  deleteCookie("token", { path: "/" });
};

interface AuthContextType {
  user: User | null | undefined;
  isLoadingUser: boolean;
  checkAuth: () => boolean;
  logout: () => void;
  loginWithEmail: UseMutationResult<AuthResponse, Error, LoginData, unknown>;
  handleGoogleLogin: () => void;
  signup: UseMutationResult<AuthResponse, Error, SignupData, unknown>;
  registerWithEmail: UseMutationResult<
    AuthResponse,
    Error,
    {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      gender: Gender;
    },
    unknown
  >;
  updateProfile: UseMutationResult<User, Error, UpdateProfileDto, unknown>;
  updateProfilePhoto: UseMutationResult<User, Error, FormData, unknown>;
  onboardCreator: UseMutationResult<
    OnboardingResponse,
    Error,
    CreatorOnboardingData
  >;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface CreatorOnboardingData {
  username: string;
  contentVisibleTo: string;
  category: CreatorCategory;
  gender?: string;
}

interface OnboardingResponse {
  user: User;
  stripeOnboardingUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const decodedToken = jwtDecode<{ exp?: number }>(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        clearAuthToken();
        return false;
      }
      return true;
    } catch {
      clearAuthToken();
      return false;
    }
  };

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!checkAuth()) return null;
      try {
        const { data } = await api.get<User>("/auth/user");
        return data;
      } catch (error) {
        console.log(error);
        clearAuthToken();
        return null;
      }
    },
  });

  const loginWithEmail = useMutation({
    mutationFn: async (data: LoginData) => {
      window.localStorage.removeItem("userMode");
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: async (data) => {
      setAuthToken(data.token);
      const { data: userData } = await api.get<User>("/auth/user");
      // return data;
      queryClient.setQueryData(["user"], userData);

      const userMode = getUserMode();
      if (userMode === "creator") {
        router.push("/profile");
      } else {
        router.push("/explore");
      }
    },
  });

  const onboardCreator = useMutation({
    mutationFn: async (data: CreatorOnboardingData) => {
      const response = await api.post<OnboardingResponse>(
        "/users/onboard-creator",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
      localStorage.setItem("userMode", "creator");
    },
  });

  const signup = useMutation({
    mutationFn: async (data: SignupData) => {
      window.localStorage.removeItem("userMode");
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.setQueryData(["user"], data.user);
      router.push("/settings/basic");
    },
  });

  const registerWithEmail = useMutation({
    mutationFn: async ({
      email,
      password,
      firstName,
      lastName,
      gender,
    }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      gender: Gender;
    }) => {
      window.localStorage.removeItem("userMode");
      const { data } = await api.post<AuthResponse>("/auth/register", {
        email,
        password,
        firstName,
        lastName,
        gender,
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);

      const userMode = getUserMode();
      if (userMode === "creator") {
        router.push("/profile");
      } else {
        router.push("/explore");
      }
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });

  const handleGoogleLogin = () => {
    window.localStorage.removeItem("userMode");
    const apiUrl = "https://your-backend-server.example.com.com";
    window.location.href = `${apiUrl}/auth/google`;
  };

  const logout = () => {
    clearAuthToken();
    window.localStorage.removeItem("userMode");
    queryClient.setQueryData(["user"], null);
    window.location.href = "/";
  };

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileDto) => {
      const response = await api.put<User>("/users/profile", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
    },
  });

  const updateProfilePhoto = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.put<User>("/users/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
    },
  });

  console.log({ user });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingUser,
        checkAuth,
        logout,
        handleGoogleLogin,
        loginWithEmail,
        signup,
        registerWithEmail,
        updateProfile,
        updateProfilePhoto,
        onboardCreator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
