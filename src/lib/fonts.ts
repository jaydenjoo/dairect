import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";

export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

export const geist = {
  ...GeistSans,
  variable: "--font-geist",
};

export const geistMono = {
  ...GeistMono,
  variable: "--font-geist-mono",
};

export const pretendard = localFont({
  src: [{ path: "../fonts/PretendardVariable.woff2", style: "normal" }],
  display: "swap",
  variable: "--font-pretendard",
});

export const fontVariables = [
  fraunces.variable,
  geist.variable,
  geistMono.variable,
  pretendard.variable,
].join(" ");
