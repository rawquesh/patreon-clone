import { Box, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  image: string;
  name: string;
  description: string;
  href: string;
}

const CreatorCard: React.FC<Props> = ({ description, href, image, name }) => {
  return (
    <Link href={href}>
      <Stack w={"min"} gap={0}>
        <Box
          position={"relative"}
          height={"235px"}
          width={"233px"}
          maxW={"100%"}
          borderRadius={"8px"}
          overflow={"hidden"}
          css={{
            "& img": {
              objectPosition: "center",
              objectFit: "cover",
            },
          }}
        >
          <Image layout="fill" src={image} alt={name} />
        </Box>
        <Text maxW={"233px"} mt={2} fontWeight={600}>
          {name}
        </Text>
        <Text maxW={"233px"} fontSize={"sm"} color={"star.600"}>
          {description}
        </Text>
      </Stack>
    </Link>
  );
};

export default CreatorCard;
