import type { Metadata } from "next";
import { PageLayout } from "./page-layout";

export const metadata: Metadata = {
  title: "Patreon Clone",
  description: "Patreon Clone app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PageLayout>{children}</PageLayout>;
}
