import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import "./fonts.css";
import "./main.css";
import { tiempostFont } from "@/lib/font";
import ReactQueryProviders from "@/lib/react-query";
import { AuthProvider } from "@/context/auth.provider";
import { Toaster } from "@/components/ui/toaster";
import { UserModeProvider } from "@/context/user-mode.provider";
import { ChatProvider } from "@/context/chat.provider";
import { SubscriptionProvider } from "@/context/subscription.provider";
import { NotificationsProvider } from "@/context/notifications.provider";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const epilogue = Epilogue({
  variable: "--font-epilogue-mono",
  subsets: ["latin"],
});

// Get the base URL for absolute image URLs
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Fallback for development - will be replaced by actual domain in production
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://patreon-clone.example.com";
};

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Patreon Clone",
  description: "Build a thriving Jewish Community online",
  icons: {
    icon: "/icons/logo.svg",
    apple: "/icons/logo.svg",
    shortcut: "/icons/logo.svg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  openGraph: {
    title: "Patreon Clone",
    description: "Build a thriving Jewish Community online",
    url: baseUrl,
    siteName: "Patreon Clone",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Patreon Clone - Build a thriving Jewish Community online",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Patreon Clone",
    description: "Build a thriving Jewish Community online",
    images: ["/hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${epilogue.variable} ${tiempostFont.variable}`}
      >
        <Provider>
          <ReactQueryProviders>
            <AuthProvider>
              <UserModeProvider>
                <ChatProvider>
                  <NotificationsProvider>
                    <SubscriptionProvider>
                      <div className="light">{children}</div>
                    </SubscriptionProvider>
                  </NotificationsProvider>
                </ChatProvider>
              </UserModeProvider>
            </AuthProvider>
          </ReactQueryProviders>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
