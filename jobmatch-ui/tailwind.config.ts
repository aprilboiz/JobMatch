import type { Config } from "tailwindcss"

const config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
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
        "0%": { opacity: "0", transform: "translateY(10px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
      "slide-in": {
        "0%": { transform: "translateX(-100%)" },
        "100%": { transform: "translateX(0)" },
      },
      float: {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-10px)" },
      },
      glow: {
        "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
        "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)" },
      },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      "fade-in": "fade-in 0.5s ease-out",
      "slide-in": "slide-in 0.3s ease-out",
      float: "float 3s ease-in-out infinite",
      glow: "glow 2s ease-in-out infinite",
    },
    backgroundImage: {
      "fabric-texture": `
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 2px, transparent 2px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 1px, transparent 1px)
      `,
      "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
    },
    boxShadow: {
      "3d": "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.05)",
      "3d-hover": "0 16px 48px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.1)",
      "inner-3d": "inset 0 2px 4px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.5)",
      glow: "0 0 20px rgba(59, 130, 246, 0.3)",
      "glow-lg": "0 0 40px rgba(59, 130, 246, 0.4)",
    },
    backdropBlur: {
      xs: "2px",
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
