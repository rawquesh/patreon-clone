"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth.provider";
import { setCookie } from "cookies-next";
import { usePathname } from "next/navigation";

type UserMode = "creator" | "user";

interface UserModeContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(
  undefined
);

export const UserModeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<UserMode>("user");
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();
  const pathname = usePathname();

  const setMode = (newMode: UserMode) => {
    setModeState(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("userMode", newMode);
      setCookie("userMode", newMode, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // const cookieMode = getCookie("userMode") as UserMode | undefined;
      const savedMode = localStorage.getItem("userMode") as UserMode;

      let newMode: UserMode = "user";
      // ;
      // console.log("cookieMode", cookieMode);
      // console.log("savedMode", savedMode);
      if (savedMode === "creator" || savedMode === "user") {
        newMode = savedMode;
      }

      setModeState(newMode);

      localStorage.setItem("userMode", newMode);
      setCookie("userMode", newMode, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      });

      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && !isLoadingUser && user) {
      const currentPath = window.location.pathname;

      if (currentPath === "/") {
        console.log("pushing to profile");
        if (mode === "creator") {
          router.push("/profile");
        } else if (!pathname.includes("profile")) {
          router.push("/explore");
        }
      }
    }
  }, [isInitialized, isLoadingUser, user, mode, router, pathname]);

  return (
    <UserModeContext.Provider value={{ mode, setMode }}>
      {children}
    </UserModeContext.Provider>
  );
};

export const useUserMode = (): UserModeContextType => {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error("useUserMode must be used within a UserModeProvider");
  }
  return context;
};
