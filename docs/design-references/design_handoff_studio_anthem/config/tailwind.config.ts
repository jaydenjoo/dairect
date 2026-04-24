// tailwind.config.ts
//
// Tailwind CSS 4 primarily uses @theme in CSS (see tokens/theme.css).
// This file is only needed for content paths + a couple plugin hooks.

import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx,mdx}",
  ],

  // Tailwind 4: most config (colors, fonts, spacing) lives in @theme in CSS.
  // Anything that cannot be expressed there goes here.
  theme: {
    extend: {
      // Track custom letter-spacing presets used heavily across the design
      letterSpacing: {
        "tight-1": "-0.01em",
        "tight-2": "-0.02em",
        "tight-3": "-0.025em",
        "mono-wide": "0.12em",
        "label-wide": "0.18em",
      },
    },
  },

  // ⚠️ Intentionally NO plugins. The Studio Anthem is all hand-set 1px
  // hairlines + sharp shadows; no prose/forms/typography plugins help here.
  plugins: [],
} satisfies Config;
