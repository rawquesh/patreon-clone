"use client";

import React, { Suspense } from "react";
import DesktopSidenav from "./desktop";
import MobileSideNav from "./mobile";
import { useUserMode } from "@/context/user-mode.provider";
import { useAuth } from "@/context/auth.provider";

interface Props {
  mode: "creator" | "user";
}

const SideNav: React.FC<Props> = () => {
  const { mode } = useUserMode();
  const { user, isLoadingUser } = useAuth();

  const currentMode = mode;

  if (!user && !isLoadingUser) {
    return null;
  }

  return (
    <>
      <DesktopSidenav mode={currentMode} />
      <Suspense>
        <MobileSideNav mode={currentMode} />
      </Suspense>
    </>
  );
};

export default SideNav;
