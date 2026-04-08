"use client";
import { Flex, Grid, IconButton, Stack } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
  containerProps: React.ComponentProps<typeof Grid>;
}

const Scroller: React.FC<Props> = ({
  titleComponent,
  containerProps,
  children,
}) => {
  const [isScrollLeftDisabled, setIsScrollLeftDisabled] = useState(true);
  const [isScrollRightDisabled, setIsScrollRightDisabled] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [scrollWidth, setScrollWidth] = useState(381);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      if (sliderRef.current) {
        const container = sliderRef.current;
        setIsScrollLeftDisabled(container.scrollLeft === 0);
        setIsScrollRightDisabled(
          container.scrollLeft + container.offsetWidth >= container.scrollWidth
        );
      }
    };

    if (sliderRef.current) {
      // window.slider = sliderRef.current;
      setScrollWidth(sliderRef.current.offsetWidth);
      sliderRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (sliderRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        sliderRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [sliderRef]);

  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: sliderRef.current.scrollLeft + scrollWidth,
        behavior: "smooth",
      });
    }
  };
  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: sliderRef.current.scrollLeft - scrollWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <Stack>
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        {titleComponent}
        <Flex gap={2} alignItems={"center"}>
          <IconButton
            rounded={"999px"}
            colorPalette={"star"}
            onClick={slideLeft}
            disabled={isScrollLeftDisabled}
            backgroundColor={"blue.700"}
            _disabled={{
              backgroundColor: "blue.200",
            }}
          >
            <Icon icon={"icon-park-solid:left-one"} />
          </IconButton>
          <IconButton
            rounded={"999px"}
            colorPalette={"star"}
            onClick={slideRight}
            disabled={isScrollRightDisabled}
            backgroundColor={"blue.700"}
            _disabled={{
              backgroundColor: "blue.200",
            }}
          >
            <Icon icon={"icon-park-solid:right-one"} />
          </IconButton>
        </Flex>
      </Flex>
      <Grid
        className="no-scrollbar"
        overflowX={"scroll"}
        {...containerProps}
        ref={sliderRef}
      >
        {children}
      </Grid>
    </Stack>
  );
};

export default Scroller;
