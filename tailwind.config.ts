
import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#4F46E5", // Indigo vibrante (A2Tickets)
          foreground: "#FFFFFF",
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          900: "#312E81",
        },
        secondary: {
          DEFAULT: "#EC4899", // Rosa vibrante (Complementar)
          foreground: "#FFFFFF",
          50: "#FDF2F8",
          100: "#FCE7F3",
          500: "#EC4899",
          600: "#DB2777",
          900: "#831843",
        },
        accent: {
          DEFAULT: "#06B6D4", // Ciano (Moderno)
          foreground: "#FFFFFF",
          50: "#ECFEFF",
          100: "#CFFAFE",
          500: "#06B6D4",
          600: "#0891B2",
          900: "#164E63",
        },
        card: {
          DEFAULT: "#FFF6E5", // Bege pastel claro
          foreground: "#2E2E2E",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#6B6B6B",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2E2E2E",
        },
        text: {
          primary: "#2E2E2E", // Cinza carvão
          secondary: "#6B6B6B", // Cinza claro
        }
      },
      fontFamily: {
        'heading': ['Poppins', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        container: "1280px",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: 'marquee var(--duration) linear infinite',
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" }
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' }
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "bounce-gentle": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          }
        },
      },
      backgroundImage: {
        'page': 'linear-gradient(135deg, #FFF6E5 0%, #F8F9FA 100%)',
        'gradient-primary': 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      },
    },
    container: {
      center: true,
      padding: "2rem",
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
