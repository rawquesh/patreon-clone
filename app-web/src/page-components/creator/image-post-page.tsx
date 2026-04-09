import PostPageCreatorInfo from "@/page-components/creator/post-page-creator-info";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { AspectRatio, Flex, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import React, { Suspense } from "react";
import PostLike from "./post-like";
import IconText from "@/components/ui/icon-text";
import PostCommentsSection from "./post-comments-section";

const ImagePostPageComponent: React.FC = () => {
  return (
    <Flex
      p={"16px"}
      w={"100vw"}
      direction={{ base: "column-reverse", lg: "row" }}
      maxW={"1150px"}
      mx={"auto"}
      gap={8}
    >
      <Stack gap={0} flexGrow={1}>
        <AspectRatio
          borderRadius={"12px"}
          overflow={"hidden"}
          pos={"relative"}
          ratio={1.33333 / 1}
        >
          <Image src={"/images/image-post.jpg"} alt="title" layout="fill" />
        </AspectRatio>
        <Text mt={6} fontSize={"2xl"} fontWeight={600}>
          Post-1
        </Text>
        <Text mb={6} fontSize={"sm"} color={"star.600"}>
          {getTimeAgo("2025-01-27")}
        </Text>
        <Text>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi
          possimus dolor in repellendus unde! Quo cupiditate praesentium eveniet
          veniam quae doloribus, eligendi maxime quasi earum qui soluta esse?
          Voluptatem, aliquam! Nam dolore dignissimos assumenda accusamus
          voluptatibus vero porro veritatis! Quibusdam, facilis laboriosam quae
          commodi veritatis dolores id, placeat earum nemo deserunt tenetur
          perspiciatis nisi cumque nihil quis vel sequi similique? Delectus eum
          totam veritatis? Est aut qui, quaerat repudiandae mollitia nostrum
          dicta dolor aliquid maiores eos incidunt harum sed a labore explicabo
          culpa ipsa. Placeat, quisquam sed quos porro tempora temporibus ex
          voluptates autem repellendus tenetur ullam natus nemo saepe voluptatem
          sint corporis mollitia minus necessitatibus maiores est laudantium
          nihil quae dolor perspiciatis? Totam, possimus.
        </Text>
        <Flex my={4} gap={4}>
          <Suspense>
            <PostLike postId="123" likes={12} liked />
          </Suspense>
          <IconText
            containerProps={{ cursor: "pointer" }}
            icon="iconamoon:comment-fill"
            text={String(1)}
          />
        </Flex>
        <Suspense>
          <PostCommentsSection postId="123" className="glass-card" />
        </Suspense>
      </Stack>
      <PostPageCreatorInfo
        avatarUrl="https://cdn.myanimelist.net/r/84x124/images/characters/9/131317.webp?s=d4b03c7291407bde303bc0758047f6bd"
        description="Content creator"
        membership="$5 per month"
        username="USER1"
      />
    </Flex>
  );
};

export default ImagePostPageComponent;
