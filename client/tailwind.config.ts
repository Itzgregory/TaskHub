import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class", "dark"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "inter", "sans-serif"],
        mono: ["JetBrains Mono", "iawriter-mono", "monospace"],
        display: ["Permanent Marker", "permanent-marker", "cursive"],
      },
      colors: {
        /* === TaskHub design tokens mapped to Tailwind === */
        "tex-pri": "var(--c-texPri)",
        "tex-sec": "var(--c-texSec)",
        "tex-ter": "var(--c-texTer)",
        "tex-dis": "var(--c-texDis)",
        "tex-acc": "var(--c-texAccPri)",
        "tex-inv": "var(--c-texInvPri)",

        "ico-pri": "var(--c-icoPri)",
        "ico-sec": "var(--c-icoSec)",
        "ico-ter": "var(--c-icoTer)",

        "bac-pri": "var(--c-bacPri)",
        "bac-sec": "var(--c-bacSec)",
        "bac-ter": "var(--c-bacTer)",
        "bac-ele": "var(--c-bacEle)",

        "bor-pri": "var(--c-borPri)",
        "bor-sec": "var(--c-borSec)",
        "bor-str": "var(--c-borStr)",
        "bor-acc": "var(--c-borAccPri)",

        /* Blue accent */
        "blu-acc": "var(--c-bluTexAccPri)",
        "blu-bac": "var(--c-bluBacSec)",
        "blu-bac-pri": "var(--c-bluBacPri)",
        "blu-bor": "var(--c-bluBorPri)",

        /* Red */
        "red-tex": "var(--c-redTexPri)",
        "red-tex-acc": "var(--c-redTexAccPri)",
        "red-bac": "var(--c-redBacPri)",
        "red-bac-sec": "var(--c-redBacSec)",
        "red-bor": "var(--c-redBorPri)",

        /* Green */
        "gre-tex": "var(--c-greTexPri)",
        "gre-tex-acc": "var(--c-greTexAccPri)",
        "gre-bac": "var(--c-greBacPri)",
        "gre-bac-sec": "var(--c-greBacSec)",
        "gre-bor": "var(--c-greBorPri)",

        /* Yellow */
        "yel-tex": "var(--c-yelTexPri)",
        "yel-tex-acc": "var(--c-yelTexAccPri)",
        "yel-bac": "var(--c-yelBacPri)",
        "yel-bac-sec": "var(--c-yelBacSec)",

        /* Orange */
        "ora-tex": "var(--c-oraTexPri)",
        "ora-tex-acc": "var(--c-oraTexAccPri)",
        "ora-bac": "var(--c-oraBacPri)",
        "ora-bac-sec": "var(--c-oraBacSec)",

        /* Shadcn compat */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "th-xs": "var(--c-shaXS)",
        "th-sm": "var(--c-shaSM)",
        "th-md": "var(--c-shaMD)",
        "th-lg": "var(--c-shaLG)",
        "th-out-sm": "var(--c-shaOutSm)",
        "th-out-md": "var(--c-shaOutMd)",
        "th-out-lg": "var(--c-shaOutLg)",
        "th-dialog": "var(--c-froDiaSha)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "check-bounce": {
          "0%": { transform: "scale(0.8)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
        "check-bounce": "check-bounce 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
