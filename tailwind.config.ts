import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        famli: {
          // Primary warm orange
          50:  "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",   // brand primary
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          // Accent pink (birthdays, celebrations)
          pink: "#F472B6",
          "pink-light": "#FDF2F8",
          // Warm backgrounds
          cream: "#FFF8F1",
          parchment: "#FEF3E2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "warm-sm": "0 1px 3px 0 rgba(249, 115, 22, 0.1)",
        "warm":    "0 4px 6px -1px rgba(249, 115, 22, 0.12), 0 2px 4px -2px rgba(249, 115, 22, 0.08)",
        "warm-lg": "0 10px 25px -3px rgba(249, 115, 22, 0.15), 0 4px 6px -4px rgba(249, 115, 22, 0.1)",
        "card":    "0 2px 12px 0 rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 24px 0 rgba(0, 0, 0, 0.1)",
      },
      backgroundImage: {
        "gradient-warm": "linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FCD34D 100%)",
        "gradient-hero": "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
        "gradient-pink": "linear-gradient(135deg, #F472B6 0%, #FB923C 100%)",
        "gradient-card": "linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-gentle": "bounceGentle 1s infinite",
        "pulse-warm": "pulseWarm 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseWarm: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
}

export default config
