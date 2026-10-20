"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "plyr/dist/plyr.css";
import { Box } from "@chakra-ui/react";

// import dynamic from "next/dynamic";

// We'll initialize Plyr only after dynamic import in the useEffect

// Plyr's own bundled types don't surface a standalone `Options` type export,
// so the `options` prop is kept structurally open (object-valued keys only).
type PlyrOptions = Record<string, unknown>;

interface VideoPlayerProps {
	src: string;
	width?: string;
	height?: string;
	options?: PlyrOptions;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
	src,
	width = "100%",
	height = "auto",
	options = {},
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const playerRef = useRef<{ destroy: () => void } | null>(null);
	const [isReady, setIsReady] = useState(false);

	const initializePlyr = useCallback(async () => {
		if (!videoRef.current) return;

		if (playerRef.current) {
			playerRef.current.destroy();
		}

		const defaultOptions: PlyrOptions = {
			controls: [
				"play-large",
				"play",
				"progress",
				"current-time",
				"duration",
				"mute",
				"volume",
				"settings",
				"fullscreen",
			],
			settings: ["quality", "speed"],
			speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
			keyboard: { focused: true, global: true },
			tooltips: { controls: true, seek: true },
			seekTime: 10,
		};
		try {
			const PlyrImport = await import("plyr");
			const player = new PlyrImport.default(videoRef.current, {
				...defaultOptions,
				...options,
			});

			player.on("ready", () => {
				setIsReady(true);
			});

			player.on("error", (error) => {
				console.error("Plyr error:", error);
				setIsReady(false);
			});

			playerRef.current = player;
		} catch (error) {
			console.log(error);
		}
	}, [options]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const timeoutId = setTimeout(() => {
				initializePlyr().catch(console.error);
			}, 0);

			return () => {
				clearTimeout(timeoutId);
				if (playerRef.current) {
					playerRef.current.destroy();
				}
				setIsReady(false);
			};
		}
	}, [src, initializePlyr]);

	const customStyles = {
		"--plyr-color-main": "#00b3ff",
		"--plyr-range-fill-background": "#00b3ff",
		"--plyr-control-radius": "3px",
		"--plyr-audio-controls-background": "#2c3e50",
		"--plyr-audio-control-color": "#ffffff",
		"--plyr-audio-control-color-hover": "#00b3ff",
		"--plyr-control-spacing": "10px",
		opacity: isReady ? 1 : 0,
		transition: "opacity 0.3s ease-in-out",
	} as React.CSSProperties;

	return (
		<Box
			width={width}
			height={height}
			style={customStyles}
			className="video-player-container"
			position="relative"
		>
			{!isReady && (
				<Box
					position="absolute"
					top="50%"
					left="50%"
					transform="translate(-50%, -50%)"
					zIndex={1}
				>
					Loading player...
				</Box>
			)}
			<video ref={videoRef} className="plyr-react plyr" preload="metadata">
				<source src={src} type="video/mp4" />
				Your browser does not support the video tag.
			</video>
		</Box>
	);
};

export default VideoPlayer;
