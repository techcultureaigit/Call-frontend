import { Inter, JetBrains_Mono, Noto_Sans_Devanagari } from "next/font/google";
import type { FontConfig } from "@/types";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/** Hindi / Devanagari script for call transcriptions and survey copy */
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const fonts: FontConfig = {
  sans,
  mono,
};

/** Display headings use the same family as body for a cohesive CRM look */
export const fontVariables = `${sans.variable} ${mono.variable} ${devanagari.variable}`;
