"use client";
import React, { useState, useRef, useEffect } from "react";
import { Box, Flex, Text, Center, Stack, Slider } from "@chakra-ui/react";
import { FaPlay, FaPause } from "react-icons/fa";
import { Icon } from "@iconify/react/dist/iconify.js";
import Waveform from "./waveform";
import { Avatar } from "./ui/avatar";

interface AudioPlayerProps {
  src: string;
}

const CustomAudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize audio duration once loaded
  useEffect(() => {
    if (audioRef.current) {
      const handleLoadedMetadata = () => {
        setDuration(audioRef.current?.duration || 0);
      };

      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

      // Set duration right away if already loaded
      if (audioRef.current.readyState >= 2) {
        setDuration(audioRef.current.duration);
      }

      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        audioRef.current?.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      };
    }
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSliderChange = ({ value }: { value: number[] }) => {
    setCurrentTime(value[0]);
    setIsDragging(true);
  };

  const handleSliderChangeEnd = ({ value }: { value: number[] }) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      if (isPlaying) {
        audioRef.current.play();
      }
    }
    setIsDragging(false);
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      const dur = audioRef.current.duration || 0;
      const current = audioRef.current.currentTime;
      let newTime: number;

      if (seconds < 0) {
        newTime = Math.max(current + seconds, 0);
      } else {
        newTime = Math.min(current + seconds, dur);
      }

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const mobile = (
    <Stack gap={3} display={{ base: "flex", lg: "none" }}>
      <Flex mt={3} alignItems={"center"} justifyContent={"space-around"}>
        <Icon
          onClick={() => skipTime(-15)}
          width={"30px"}
          icon={"mingcute:rewind-backward-15-line"}
          cursor={"pointer"}
        />
        <Center
          as="button"
          w="12"
          h="12"
          bg="#1F78CC"
          borderRadius="full"
          onClick={handlePlayPause}
          color="white"
          _hover={{ bg: "#1F78CC" }}
          _active={{ bg: "#1F78CC" }}
          css={{
            "& svg": {
              color: "white",
            },
          }}
        >
          {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
        </Center>
        <Icon
          onClick={() => skipTime(15)}
          width={"30px"}
          icon={"mingcute:rewind-forward-15-line"}
          cursor={"pointer"}
        />
      </Flex>
      <Stack>
        <Box flex="1" position="relative">
          <Slider.Root
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSliderChange}
            onValueChangeEnd={handleSliderChangeEnd}
            cursor={"pointer"}
            css={{
              '& [data-part="thumb"]': {
                display: "block",
                width: "12px",
                height: "12px",
                backgroundColor: "#1F78CC",
                // display: "none",
              },
              "& .chakra-slider__range": {
                bg: "#1F78CC",
              },
            }}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs />
            </Slider.Control>
          </Slider.Root>
        </Box>
        <Flex justifyContent={"space-between"}>
          <Text color="star.600" fontSize="sm" w="12" textAlign="center">
            {formatTime(currentTime)}
          </Text>
          <Text color="star.600" fontSize="sm" w="12" textAlign="center">
            {formatTime(duration)}
          </Text>
        </Flex>
      </Stack>
    </Stack>
  );

  const desktop = (
    <Flex
      css={{
        "& svg": {
          color: "star.600",
        },
      }}
      h="full"
      align="center"
      px={4}
      gap={3}
      pos={"relative"}
      zIndex={100}
      display={{ base: "none", lg: "flex" }}
    >
      <Avatar h={"120px"} w={"120px"} src="/podcast.jpg" shape={"rounded"} />
      <Icon
        onClick={() => skipTime(-15)}
        width={"30px"}
        icon={"mingcute:rewind-backward-15-line"}
      />

      <Text color="star.600" fontSize="sm" w="12" textAlign="center">
        {formatTime(currentTime)}
      </Text>

      <Box flex="1" position="relative">
        <Slider.Root
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSliderChange}
          onValueChangeEnd={handleSliderChangeEnd}
          css={{
            '& [data-part="thumb"]': {
              display: "none",
              width: "14px",
              height: "14px",
              backgroundColor: "#1F78CC",
              borderRightRadius: "100px",
            },
            "& .chakra-slider__range": {
              bg: "#1F78CC",
            },
          }}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
      </Box>

      <Text color="star.600" fontSize="sm" w="12" textAlign="center">
        {formatTime(duration)}
      </Text>

      <Icon
        onClick={() => skipTime(15)}
        width={"30px"}
        icon={"mingcute:rewind-forward-15-line"}
      />

      <Center
        as="button"
        w="12"
        h="12"
        bg="#1F78CC"
        borderRadius="full"
        onClick={handlePlayPause}
        color="white"
        _hover={{ bg: "#1F78CC" }}
        _active={{ bg: "#1F78CC" }}
        css={{
          "& svg": {
            color: "white !important",
          },
        }}
      >
        {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
      </Center>
    </Flex>
  );

  return (
    <Stack
      justifyContent={"center"}
      px={{ base: "16px", lg: "24px" }}
      pt={{ base: "16px", lg: "24px" }}
      w="full"
      position="relative"
      overflow={"hidden"}
      maxW={"100vw"}
    >
      <Flex
        display={{ base: "flex", lg: "none" }}
        w={"100%"}
        justifyContent={"center"}
      >
        <Avatar
          h={"120px"}
          w={"120px"}
          src="/podcast.jpg"
          shape={"rounded"}
          zIndex={99}
        />
      </Flex>
      <Waveform duration={duration} src={src} currentTime={currentTime} />

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      {mobile}
      {desktop}
    </Stack>
  );
};

export default CustomAudioPlayer;
