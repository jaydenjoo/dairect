// lib/fonts.ts
//
// next/font loaders for The Studio Anthem.
// Imported once in app/layout.tsx, applied to <html> via className.

import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

/**
 * Fraunces — editorial display serif.
 * Weight range matches actual usage in the design (no bold italic extremes).
 * `adjustFontFallback` auto-generates a metric-matched @font-face from
 * Georgia's metrics — combined with our manual "Fraunces Fallback" in
 * globals.css this gives ~0 CLS on font swap.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
  adjustFontFallback: "Times New Roman",
});

/**
 * Geist — body/UI sans. Vercel's font, shipped as an npm package.
 * Already CSS-variable-ready; just re-export with our variable name.
 */
export const geist = {
  ...GeistSans,
  variable: "--font-geist",
};

export const geistMono = {
  ...GeistMono,
  variable: "--font-geist-mono",
};

/**
 * Pretendard — Korean sans. Not on Google Fonts with full weight range,
 * so we pull the official CDN variable-axis file.
 * Add to app/layout.tsx:
 *
 *   <link
 *     rel="stylesheet"
 *     href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
 *   />
 *
 * (Consider self-hosting in /public/fonts after first ship for performance.)
 */

/** Compose className string for <html>. */
export const fontVariables = [
  fraunces.variable,
  geist.variable,
  geistMono.variable,
].join(" ");
