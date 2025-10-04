import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Arial", "sans-serif"]
      },
      colors: {
        accent: { DEFAULT: "#FF453A" }
      },
      boxShadow: {
        card: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 30px rgba(0,0,0,0.25)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)"
      },
      backgroundSize: { grid: "22px 22px" }
    }
  },
  plugins: []
} satisfies Config;