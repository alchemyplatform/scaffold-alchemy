import { withAccountKitUi } from "@account-kit/react/tailwind";

/** @type {import('tailwindcss').Config} */
export default withAccountKitUi({
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#93BBFB",
          "primary-content": "#212638",
          secondary: "#DAE8FF",
          "secondary-content": "#212638",
          accent: "#93BBFB",
          "accent-content": "#212638",
          neutral: "#212638",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f4f8ff",
          "base-300": "#DAE8FF",
          "base-content": "#212638",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#212638",
          "primary-content": "#F9FBFF",
          secondary: "#323f61",
          "secondary-content": "#F9FBFF",
          accent: "#4969A6",
          "accent-content": "#F9FBFF",
          neutral: "#F9FBFF",
          "neutral-content": "#385183",
          "base-100": "#385183",
          "base-200": "#2A3655",
          "base-300": "#212638",
          "base-content": "#F9FBFF",
          info: "#385183",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 3s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        twinkle: {
          "0%, 100%": {
            transform: "scale(0.5) rotate(0deg)",
            opacity: 0.3,
          },
          "50%": {
            transform: "scale(1.2) rotate(180deg)",
            opacity: 1,
          },
        },
      },
      colors: {
        hufflepuff: {
          yellow: "#FFD800",
          black: "#000000",
        },
        ravenclaw: {
          blue: "#0E1A40",
          bronze: "#946B2D",
        },
        gryffindor: {
          red: "#740001",
          gold: "#D3A625",
        },
        slytherin: {
          green: "#1A472A",
          silver: "#5D5D5D",
        },
      },
      cursor: {
        "sorting-hat": 'url("/sorting-hat-cursor.png"), pointer',
      },
    },
  },
  safelist: [
    "from-hufflepuff-yellow",
    "to-hufflepuff-black",
    "from-ravenclaw-blue",
    "to-ravenclaw-bronze",
    "from-gryffindor-red",
    "to-gryffindor-gold",
    "from-slytherin-green",
    "to-slytherin-silver",
    "bg-gradient-to-br",
    "animation-delay-500",
    "animation-delay-1000",
    "animate-float",
    "animate-twinkle",
    "backdrop-blur-sm",
  ],
});
