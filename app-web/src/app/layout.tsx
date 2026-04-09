import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import "./fonts.css";
import "./main.css";
import ReactQueryProviders from "@/lib/react-query";
import { AuthProvider } from "@/context/auth.provider";
import { Toaster } from "@/components/ui/toaster";
import { UserModeProvider } from "@/context/user-mode.provider";
import { ChatProvider } from "@/context/chat.provider";
import { SubscriptionProvider } from "@/context/subscription.provider";
import { NotificationsProvider } from "@/context/notifications.provider";
import { seoDefaults, getBaseUrl, viewport } from "@/config/seo";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  ...seoDefaults(baseUrl),
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
        className={`${sora.variable} ${dmSans.variable}`}
      >
        <Provider>
          <ReactQueryProviders>
            <AuthProvider>
              <UserModeProvider>
                <ChatProvider>
                  <NotificationsProvider>
                    <SubscriptionProvider>
                      <div className="bg-gradient-overlay" style={{ minHeight: "100vh" }}>
                        {children}
                      </div>
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
