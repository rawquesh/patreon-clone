import type { Metadata } from "next";
import { PageLayout } from "./page-layout";
import { branding } from "@/config/branding";

export const metadata: Metadata = {
  title: branding.name,
  description: `${branding.name} creator`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PageLayout>{children}</PageLayout>;
}
