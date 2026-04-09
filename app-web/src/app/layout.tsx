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
import { seoDefaults, getBaseUrl, viewport } from "@/config/seo";

const epilogue = Epilogue({
  variable: "--font-epilogue-mono",
  subsets: ["latin"],
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
