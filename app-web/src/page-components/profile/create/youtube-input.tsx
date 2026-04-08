"use client";

import React, { useState } from "react";
import { Box, AspectRatio, Input } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { InputGroup } from "@/components/ui/input-group";

interface Props {
  defaultUrl?: string;
  onUrlChange?: (url: string) => void;
}

const YouTubePlayer: React.FC<Props> = ({ defaultUrl = "", onUrlChange }) => {
  const [url, setUrl] = useState(defaultUrl);
  const [videoId, setVideoId] = useState<string | null>(
    defaultUrl ? getYouTubeId(defaultUrl) : null
  );

  function getYouTubeId(url: string): string | null {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2] && match[2].length === 11) {
      return match[2];
    }
    return null;
  }

  // Sync with defaultUrl prop changes (e.g., when switching tabs in edit mode)
  React.useEffect(() => {
    // Only update if defaultUrl changes and is different from current url
    // This preserves user input while allowing restoration from props
    if (defaultUrl !== url) {
      setUrl(defaultUrl);
      const newVideoId = defaultUrl ? getYouTubeId(defaultUrl) : null;
      setVideoId(newVideoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    const newVideoId = getYouTubeId(newUrl);
    setVideoId(newVideoId || null);
    onUrlChange?.(newUrl);
  };

  return (
    <Box>
      <InputGroup
        startElement={<Icon icon="material-symbols:link" />}
        w={"100%"}
        mb={4}
      >
        {/* <InputLeftElement pointerEvents="none">
					<Icon icon="material-symbols:link" />
				</InputLeftElement> */}
        <Input
          placeholder="Type or paste video URL"
          value={url}
          onChange={handleUrlChange}
          border="none"
          borderRadius="md"
          variant={"subtle"}
        />
      </InputGroup>

      {url && videoId && (
        <AspectRatio ratio={16 / 9}>
          <Box
            as="iframe"
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            src={`https://www.youtube.com/embed/${videoId}`}
            allowFullScreen
            borderRadius="md"
            border="none"
          />
        </AspectRatio>
      )}
    </Box>
  );
};

export default YouTubePlayer;
