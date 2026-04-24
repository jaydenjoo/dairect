import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";

export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
  variable: "--font-fraunces",
});

export const geist = GeistSans;
export const geistMono = GeistMono;

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
