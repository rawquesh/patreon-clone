"use client";
import React, { ReactNode, useRef } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Box, IconButton } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";

import "swiper/css";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
  cards: ReactNode[];
}

const Carousel: React.FC<Props> = ({ cards }) => {
  const swiperRef = useRef<SwiperCore | null>(null);

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <Box
      display={"flex"}
      maxW={{ base: "100vw", lg: "1100px" }}
      mx="auto"
      w={"fit"}
      px={6}
      alignItems={"center"}
      gap={3}
      css={{
        "& .slider": {
          width: { base: "317px", lg: "100%" },
          minW: "317px",
        },
        "& .slider-slide": {
          minW: "300px",
          // margin: "0 auto",
        },
      }}
    >
      {cards.length > 1 && (
        <IconButton
          borderRadius={"999px"}
          onClick={handlePrev}
          variant={"outline"}
        >
          <Icon icon={"formkit:left"} />
        </IconButton>
      )}
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          1280: { slidesPerView: 3 },
          1024: { slidesPerView: 2 },
          768: { slidesPerView: 1 },
        }}
        className="slider"
        // style={{
        //   width: "317px",
        // }}
      >
        {cards.map((card, i) => (
          <SwiperSlide
            // style={{ width: "max-content", border: "2px solid red" }}
            key={i}
            className="slider-slide"
          >
            {card}
          </SwiperSlide>
        ))}
      </Swiper>
      {cards.length > 1 && (
        <IconButton
          borderRadius={"999px"}
          onClick={handleNext}
          variant={"outline"}
        >
          <Icon icon={"formkit:right"} />
        </IconButton>
      )}
    </Box>
  );
};

export default Carousel;
