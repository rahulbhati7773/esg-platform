/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50:  "#f0f7f4",
          100: "#d8ede5",
          200: "#b3dace",
          300: "#82c0ae",
          400: "#4d9e88",
          500: "#2d7d65",
          600: "#1f6350",
          700: "#174f40",
          800: "#113d31",
          900: "#0b3024",
          950: "#061d16",
        },
        gold: {
          300: "#e8c97a",
          400: "#d4a843",
          500: "#b8892a",
          600: "#9a6e1e",
        },
        cream: {
          50:  "#fdfbf7",
          100: "#f8f4ec",
          200: "#f0e9d6",
        },
      },
      fontFamily: {
        display: ["'Lora'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.4s ease-out both",
        fadeIn: "fadeIn 0.3s ease-out both",
        slideInRight: "slideInRight 0.35s ease-out both",
        shimmer: "shimmer 2s infinite linear",
        countUp: "countUp 0.5s ease-out forwards",
      },
      boxShadow: {
        card: "0 1px 3px rgba(11,48,36,0.08), 0 4px 16px rgba(11,48,36,0.06)",
        "card-hover": "0 4px 12px rgba(11,48,36,0.12), 0 8px 24px rgba(11,48,36,0.08)",
        sidebar: "2px 0 20px rgba(11,48,36,0.15)",
      },
    },
  },
  plugins: [],
};
