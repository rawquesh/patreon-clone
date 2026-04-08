"use client";

import ExplorePage from "@/page-components/explore";
import React, { Suspense } from "react";

const Explore: React.FC = () => {
  return (
    <Suspense>
      <ExplorePage />
    </Suspense>
  );
};

export default Explore;
