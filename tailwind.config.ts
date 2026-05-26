import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211d",
        muted: "#66736d",
        canvas: "#f5f7f2",
        line: "#dfe7df",
        brand: "#0f766e",
        rust: "#b45309",
      },
      borderRadius: {
        card: "8px",
      },
      boxShadow: {
        soft: "0 22px 70px rgba(23, 33, 29, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
