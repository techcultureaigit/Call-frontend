import { Geist, Geist_Mono } from "next/font/google";
import type { FontConfig } from "@/types";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const fonts: FontConfig = {
  sans: geistSans,
  mono: geistMono,
};

export const fontVariables = `${geistSans.variable} ${geistMono.variable}`;
