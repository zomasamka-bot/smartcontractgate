import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_CONFIG } from "@/lib/app-config";
import { ErrorBoundary } from "@/components/error-boundary";
import { PiSDKProvider } from "@/components/pi-sdk-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const appDescription = APP_CONFIG.DESCRIPTION;

export const metadata: Metadata = {
  title: "Made with App Studio",
  description: appDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Made with App Studio",
    description: appDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Made with App Studio",
    description: appDescription,
  },
    generator: 'v0.app'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PiSDKProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </PiSDKProvider>
      </body>
    </html>
  );
}
