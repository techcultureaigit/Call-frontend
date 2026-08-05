import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers";
import { fontVariables } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: [
      { url: "/favicon.svg?v=call-crm-v2", type: "image/svg+xml" },
      { url: "/icon?v=call-crm-v2", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.svg?v=call-crm-v2",
    apple: "/icon?v=call-crm-v2",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} h-svh overflow-hidden antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
