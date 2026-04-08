import type { Metadata } from "next";
import { PageLayout } from "./page-layout";

export const metadata: Metadata = {
  title: "Patreon Clone",
  description: "Patreon Clone explore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PageLayout>{children}</PageLayout>;
}
