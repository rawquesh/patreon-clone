// components/posts/RichTextPreview.tsx
import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Link as ChakraLink, List } from "@chakra-ui/react";
import parse, {
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";
import NextLink from "next/link"; // Use NextLink for client-side navigation

// Import necessary Chakra components (same as in the full page component)
import {
  Heading,
  Text,
  Image,
  Link as ChakraUiLink, // Alias to avoid conflict with NextLink
} from "@chakra-ui/react";

interface RichTextPreviewProps {
  htmlContent: string;
  maxHeight?: string; // e.g., "100px"
  postId: string;
}

const RichTextPreview: React.FC<RichTextPreviewProps> = ({
  htmlContent,
  maxHeight = "100px", // Default preview height
  postId,
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Re-use or adapt the parser options from your full post page
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.type === "tag") {
        const { name, attribs, children } = domNode;
        const reactChildren = domToReact(children as DOMNode[], parserOptions);

        switch (name) {
          case "h1":
            return (
              <Heading as="h1" size="lg" my={2} fontSize="1.1em">
                {reactChildren}
              </Heading>
            ); // Slightly smaller for preview
          case "h2":
            return (
              <Heading as="h2" size="md" my={2} fontSize="1.0em">
                {reactChildren}
              </Heading>
            );
          // Add other heading levels if needed, potentially simplifying them further
          case "p":
            if (
              children.length === 1 &&
              children[0].type === "tag" &&
              children[0].name === "br"
            ) {
              return <Box h="0.5em" />; // Less space in preview
            }
            return (
              <Text my={1} fontSize={"16px"}>
                {reactChildren}
              </Text>
            ); // Smaller font size for preview
          case "a":
            return (
              <ChakraUiLink
                href={attribs.href}
                css={{ color: "hsl(211, 71%, 43%)" }}
                target="_blank"
              >
                {reactChildren}
              </ChakraUiLink>
            );
          case "img":
            return (
              <Image
                src={attribs.src}
                alt={attribs.alt || " "}
                my={2}
                maxW="80%"
                h="auto"
                objectFit="contain"
                borderRadius="sm"
              />
            ); // Smaller margin/radius
          case "ul":
            return (
              <List.Root as={"ul"} my={1} pl={3} fontSize="sm">
                {reactChildren}
              </List.Root>
            );
          case "ol":
            return (
              <List.Root as="ol" my={1} pl={3} fontSize="sm">
                {reactChildren}
              </List.Root>
            );
          case "li":
            return <List.Item>{reactChildren}</List.Item>;
          case "pre":
          case "div": // Handle code blocks within divs too
            if (
              attribs.class?.includes("ql-syntax") ||
              attribs.class?.includes("ql-code-block")
            ) {
              return (
                <Box
                  as="pre"
                  p={2}
                  my={2}
                  css={{ background: "hsl(222.2, 47.4%, 11.2%)", color: "hsl(210, 40%, 96%)" }}
                  borderRadius="sm"
                  overflowX="auto"
                  fontSize="xs"
                  fontFamily="monospace"
                >
                  {reactChildren}
                </Box>
              );
            }
            // Render other divs' content without the div itself in preview? Or skip?
            if (name === "div") return <>{reactChildren}</>;
            break; // Let default handle non-code PRE if needed, or return null
          // --- Add other simplified replacements if necessary ---
          case "strong":
            return (
              <Text as="strong" fontWeight="bold">
                {reactChildren}
              </Text>
            );
          case "em":
            return (
              <Text as="em" fontStyle="italic">
                {reactChildren}
              </Text>
            );
          // Skip blockquotes or simplify them for preview?
          // case 'blockquote': return null;
        }
      }
    },
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        // Check if the scroll height is greater than the client height
        const currentHeight = contentRef.current.scrollHeight;
        const allowedHeight = parseInt(maxHeight, 10); // Convert maxHeight string to number
        // Add a small buffer (e.g., 5px) to prevent triggering on near-exact fits
        setIsOverflowing(currentHeight > allowedHeight + 5);
      }
    };

    // Check initially and on window resize (content might reflow)
    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    // Use MutationObserver to detect changes if content loads dynamically (e.g., images loading)
    let observer: MutationObserver | null = null;
    if (contentRef.current) {
      observer = new MutationObserver(checkOverflow);
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true, // In case image src changes height
      });
    }

    return () => {
      window.removeEventListener("resize", checkOverflow);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [htmlContent, maxHeight]); // Re-run if content or maxHeight changes

  return (
    <Box position="relative">
      {/* Box to contain and measure the actual content */}
      <Box
        maxHeight={maxHeight}
        overflow="hidden"
        position="relative"
        ref={contentRef} // Ref is now on the container we measure
        className="rich-text-preview-content" // For potential CSS targeting
        // Add line height for better consistency
        lineHeight="1.5"
        fontSize="sm" // Base font size for preview
      >
        {parse(htmlContent || "", parserOptions)}
      </Box>

      {/* Fade-out Gradient and "Read More" Link */}
      {isOverflowing && (
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="60px" // Adjust gradient height
          background="linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, white 70%)" // Adjust gradient strength/position
          display="flex"
          alignItems="flex-end"
          justifyContent="flex-start"
          pt={2} // Add some padding top inside the gradient box
          pointerEvents="none" // Let clicks pass through to the link below/content
        ></Box>
      )}
      {isOverflowing && (
        <ChakraLink as={NextLink} href={`/post/${postId}`}>
          <Button
            variant="ghost" // Use link variant
            className="btn-gradient"
            size="sm"
            mt={1}
          >
            Read more
          </Button>
        </ChakraLink>
      )}
    </Box>
  );
};

export default RichTextPreview;
