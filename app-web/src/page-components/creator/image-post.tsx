/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useRef } from "react";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import IconText from "@/components/ui/icon-text";
import { getTimeAgo } from "@/utils/getTimeAgo";
import {
  Flex,
  Stack,
  Text,
  Image,
  Box,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import PostLike from "./post-like";
import PostComments from "./post-comments";
import { useRouter } from "next/navigation";
import { ShareButton } from "./share-button";
import { Link as ScrollLink } from "react-scroll";
import { UpgradeModal } from "@/components/upgrade-modal";
import { TierAccess } from "@/typings/ITierAccess";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "@/context/auth.provider";

interface Props {
  title: string;
  timeStamp: string;
  body: string;
  likes: number;
  comments: number;
  image: string;
  images: string[];
  locked: boolean;
  postId: string;
  previewText?: string;
  description?: string;
  hasAccess: boolean;
  tierAccess: TierAccess[];
  isSubscribed: boolean;
}

const ImagePost: React.FC<Props> = ({
  comments,
  likes,
  timeStamp,
  title,
  image,
  locked,
  postId,
  previewText,
  description,
  hasAccess,
  tierAccess,
  isSubscribed,
  images,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const handlePostClick = () => {
    router.push(`/post/${postId}`);
  };

  const swiperRef = useRef(null);

  return (
    <Stack className="glass-card" w="100%" p="20px" borderRadius="16px">
      <Heading
        fontSize="lg"
        fontWeight={600}
        onClick={handlePostClick}
        cursor="pointer"
        css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
      >
        {title}
      </Heading>
      <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
        {getTimeAgo(timeStamp)}
      </Text>

      <Box
        position="relative"
        cursor={locked ? "default" : "pointer"}
        _hover={{
          "& .swiper-button-prev, & .swiper-button-next": {
            opacity: hasAccess ? 1 : 0,
          },
        }}
      >
        {hasAccess ? (
          <Box position="relative">
            {images.length > 1 ? (
              <>
                <Swiper
                  //@ts-ignore
                  onSwiper={(swiper) => (swiperRef.current = swiper)}
                  modules={[Navigation, Pagination]}
                  spaceBetween={50}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  loop={true}
                  style={{ borderRadius: "12px", marginBottom: "1rem" }}
                >
                  {images?.map((imgUrl, index) => (
                    <SwiperSlide key={index} onClick={handlePostClick}>
                      <Image
                        src={imgUrl}
                        alt={`${title} image ${index + 1}`}
                        borderRadius="12px"
                        objectFit="cover"
                        width="100%"
                        height="300px"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <IconButton
                  aria-label="Previous slide"
                  position="absolute"
                  left="-1.5rem"
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={10}
                  borderRadius="full"
                  boxShadow="md"
                  //@ts-ignore
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="glass-card"
                  size="sm"
                >
                  <Icon icon={"ic:round-chevron-left"} />
                </IconButton>
                <IconButton
                  aria-label="Next slide"
                  position="absolute"
                  right="-1.5rem"
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={10}
                  borderRadius="full"
                  boxShadow="md"
                  //@ts-ignore
                  onClick={() => swiperRef.current?.slideNext()}
                  className="glass-card"
                  size="sm"
                >
                  <Icon icon={"ic:round-chevron-right"} />
                </IconButton>
              </>
            ) : (
              <Image
                src={images[0]}
                alt={title || ""}
                borderRadius="12px"
                objectFit="cover"
                width="100%"
                height="300px"
                mb={4}
              />
            )}
          </Box>
        ) : (
          <Image
            src={image}
            alt={title || ""}
            borderRadius="12px"
            objectFit="cover"
            width="100%"
            height="300px"
            mb={4}
          />
        )}

        {!hasAccess && (
          <Flex
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            borderRadius="12px"
            alignItems="center"
            justifyContent="center"
            css={{
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(2px)",
            }}
          >
            {isSubscribed ? (
              <UpgradeModal tierAccess={tierAccess} />
            ) : (
              <ScrollLink to="memberships" smooth>
                <ButtonWithIcon
                  w="fit"
                  icon="tabler:lock-filled"
                  onClick={() => {
                    if (!user) {
                      router.push(`/auth/login`);
                    }
                  }}
                  css={{
                    background: "var(--gradient-primary)",
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                >
                  Join to unlock
                </ButtonWithIcon>
              </ScrollLink>
            )}
          </Flex>
        )}
      </Box>

      {(previewText || description) && (
        <Text mb={4} onClick={handlePostClick} cursor="pointer" fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          {previewText || description}
        </Text>
      )}

      <Flex
        mt={3}
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex gap={4}>
          <PostLike likes={likes} liked={false} postId={postId} />
          <PostComments commentsCount={comments} postId={postId} />
        </Flex>
        <Flex gap={4}>
          <ShareButton postId={postId} />
          {!hasAccess && (
            <IconText
              containerProps={{ cursor: "pointer" }}
              icon="tabler:lock-filled"
              text="Locked"
              textProps={{
                lineHeight: 1.7,
                ml: "1px",
              }}
            />
          )}
        </Flex>
      </Flex>
    </Stack>
  );
};

export default ImagePost;
