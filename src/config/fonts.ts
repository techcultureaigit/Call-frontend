import { Plus_Jakarta_Sans, Space_Grotesk, Geist_Mono } from "next/font/google";
import type { FontConfig } from "@/types";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const fonts: FontConfig = {
  sans,
  mono,
};

export const fontVariables = `${sans.variable} ${display.variable} ${mono.variable}`;
