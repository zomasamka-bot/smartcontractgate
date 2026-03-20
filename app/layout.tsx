import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_CONFIG } from "@/lib/app-config";
import { ErrorBoundary } from "@/components/error-boundary";
import { PiSDKProvider } from "@/components/pi-sdk-provider";
import { PiWalletProvider } from "@/context/pi-wallet-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appName = APP_CONFIG.NAME;
const appDescription = APP_CONFIG.DESCRIPTION;
const appUrl = APP_CONFIG.APP_ORIGIN;

export const metadata: Metadata = {
  title: appName,
  description: appDescription,
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: appName,
    description: appDescription,
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
  },
    generator: 'v0.app'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PiSDKProvider>
          <PiWalletProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </PiWalletProvider>
        </PiSDKProvider>
      </body>
    </html>
  );
}
