import type { NextConfig } from "next";
import { branding } from "./src/config/branding";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_API_IMAGE_BUCKET || "patreon-clone-assets"}.s3.eu-north-1.amazonaws.com`,
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_API_IMAGE_BUCKET || "patreon-clone-test-cover"}.s3.eu-north-1.amazonaws.com`,
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_API_COLLECTIONS_BUCKET || "patreon-clone-collections"}.s3.eu-north-1.amazonaws.com`,
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_API_POSTS_BUCKET || "patreon-clone-test-dps"}.s3.eu-north-1.amazonaws.com`,
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/*/**",
      },
    ],
  },
};

export default nextConfig;
