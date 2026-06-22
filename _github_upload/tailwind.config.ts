import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18211f",
        paper: "#f7f8f4",
        mist: "#e7ece6",
        sage: "#6d8274",
        forest: "#1f7a4c",
        caution: "#b7791f",
        ember: "#c05621",
        danger: "#b42318"
      },
      boxShadow: {
        calm: "0 18px 45px rgba(24, 33, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
