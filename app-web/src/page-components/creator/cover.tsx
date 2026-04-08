import { AspectRatio } from "@chakra-ui/react";
import Image from "next/image";
import React from "react";

const Cover: React.FC<{ src: string }> = ({ src }) => {
  return (
    <AspectRatio ratio={4 / 1}>
      <Image layout="fill" src={src} alt="profile-cover" />
    </AspectRatio>
  );
};

export default Cover;
