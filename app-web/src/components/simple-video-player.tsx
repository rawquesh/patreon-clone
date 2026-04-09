"use client";

import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Flex, Slider } from "@chakra-ui/react";
import { Icon } from "@iconify/react";

interface SimpleVideoPlayerProps {
  src: string;
  width?: string;
  height?: string;
  autoplay?: boolean;
  controls?: boolean;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  src,
  width = "100%",
  height = "100%",
  autoplay = false,
  controls = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Update current time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  // Reset showControls when controls prop changes
  useEffect(() => {
    setShowControls(controls);
  }, [controls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Get video type from src extension (for blob URLs, browser will detect automatically)
  const getVideoType = (src: string): string | undefined => {
    // Blob URLs don't have extensions, let browser detect
    if (src.startsWith("blob:")) {
      return undefined;
    }

    const extension = src.split(".").pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      mp4: "video/mp4",
      webm: "video/webm",
      ogg: "video/ogg",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
    };
    return typeMap[extension || ""] || undefined;
  };

  if (!controls) {
    return (
      <Box width={width} height={height} position="relative" bg="black">
        <video
          ref={videoRef}
          width={width}
          height={height}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
          autoPlay={autoplay}
          playsInline
        >
          <source src={src} type={getVideoType(src)} />
          Your browser does not support the video tag.
        </video>
      </Box>
    );
  }

  return (
    <Box
      width={width}
      height={height}
      position="relative"
      bg="black"
      borderRadius="md"
      overflow="hidden"
    >
      <video
        ref={videoRef}
        width={width}
        height={height}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
        autoPlay={autoplay}
        playsInline
        onClick={togglePlay}
      >
        <source src={src} type={getVideoType(src)} />
        Your browser does not support the video tag.
      </video>

      {/* Controls Overlay */}
      {showControls && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
          p={4}
          transition="opacity 0.3s"
        >
          {/* Progress Bar */}
          <Slider.Root
            value={[currentTime]}
            min={0}
            max={duration || 0}
            step={0.1}
            onValueChange={(details) => handleSeek(details.value)}
            mb={3}
          >
            <Slider.Control cursor="pointer">
              <Slider.Track bg="rgba(255,255,255,0.3)">
                <Slider.Range css={{ background: "var(--gradient-primary)" }} />
              </Slider.Track>
              <Slider.Thumb index={0} boxSize="3" css={{ borderColor: "hsl(211, 71%, 43%)" }} />
            </Slider.Control>
          </Slider.Root>

          {/* Control Buttons */}
          <Flex align="center" gap={3}>
            <Button
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
              variant="ghost"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              size="sm"
              rounded="full"
              px="2"
            >
              <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} />
            </Button>

            <Flex align="center" gap={2} flex={1}>
              <Button
                aria-label={isMuted ? "Unmute" : "Mute"}
                onClick={toggleMute}
                variant="ghost"
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.2)" }}
                size="sm"
                rounded="full"
                px="2"
              >
                <Icon icon={isMuted ? "mdi:volume-off" : "mdi:volume-high"} />
              </Button>

              <Box width="80px">
                <Slider.Root
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(details) => handleVolumeChange(details.value)}
                >
                  <Slider.Control cursor="pointer">
                    <Slider.Track bg="rgba(255,255,255,0.3)">
                      <Slider.Range css={{ background: "var(--gradient-primary)" }} />
                    </Slider.Track>
                    <Slider.Thumb
                      index={0}
                      boxSize="3"
                      css={{ borderColor: "hsl(211, 71%, 43%)" }}
                    />
                  </Slider.Control>
                </Slider.Root>
              </Box>
            </Flex>

            <Flex align="center" gap={2} color="white" fontSize="sm">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </Flex>

            <Button
              aria-label="Fullscreen"
              onClick={toggleFullscreen}
              variant="ghost"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              size="sm"
              rounded="full"
              px="2"
            >
              <Icon icon="mdi:fullscreen" />
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default SimpleVideoPlayer;
