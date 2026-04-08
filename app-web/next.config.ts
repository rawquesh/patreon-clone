import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "patreon-clone-test-cover.s3.eu-north-1.amazonaws.com",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "patreon-clone-collections.s3.eu-north-1.amazonaws.com",
        port: "",
        search: "",
      },
      {
        protocol: "https",
        hostname: "patreon-clone-test-dps.s3.eu-north-1.amazonaws.com",
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
      {
        protocol: "https",
        hostname: "patreon-clone-assets.s3.eu-north-1.amazonaws.com",
        port: "",
        pathname: "/*/**",
      },
    ],
  },
};

export default nextConfig;
