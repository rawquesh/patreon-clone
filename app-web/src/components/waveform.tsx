import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { branding } from "@/config/branding";

interface Props {
  src: string;
  currentTime: number;
  duration: number;
}

const Waveform: React.FC<Props> = ({ src, currentTime, duration }) => {
  const waveContainerRef = useRef<HTMLDivElement | undefined>(undefined);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (waveContainerRef.current) {
        waveSurferRef.current = WaveSurfer.create({
          container: waveContainerRef.current,
          waveColor: branding.colors.border,
          progressColor: "#BADBFB",
          barRadius: 9999,
          barWidth: 5,
          // height: 100,
          cursorWidth: 0,
          barGap: 3,
          interact: false,
          normalize: true,
        });
        waveSurferRef.current.load(src);
      }

      // return () => {
      // 	waveSurferRef.current?.destroy();
      // };
    }
  }, [src]);

  useEffect(() => {
    if (waveSurferRef.current && duration > 0) {
      waveSurferRef.current.seekTo(currentTime / duration);
    }
  }, [currentTime, duration]);
  return (
    <Box
      pos={"absolute"}
      left={0}
      ref={waveContainerRef!}
      w="100%"
      h="100%"
      top={{ base: "16px", lg: "24px" }}
      zIndex={0}
      maxW={"100%"}
      right={0}
    />
  );
};

export default Waveform;
