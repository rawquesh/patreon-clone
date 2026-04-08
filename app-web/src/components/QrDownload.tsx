"use client";

import { useEffect, useState } from "react";
import { Image } from "@chakra-ui/react";

type QrDownloadProps = {
  size?: number; // px
};

export function QrDownload({ size = 100 }: QrDownloadProps) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    try {
      const envOrigin =
        process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
      const origin =
        envOrigin && envOrigin.length > 0 ? envOrigin : window.location.origin;
      const target = `${origin.replace(/\/$/, "")}/download`;
      const encoded = encodeURIComponent(target);
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
      setQrSrc(url);
    } catch {
      // no-op
    }
  }, [size]);

  if (!qrSrc) return null;

  return <Image src={qrSrc} alt="Scan to get the app" boxSize={`${size}px`} />;
}
