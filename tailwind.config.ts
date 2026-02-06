import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wpl: {
          blue: "#06357A",
          red: "#D31245",
          gray: "#656668",
          navy: "#021531",
          bg: "#F6F6F6",
          border: "#E8E8E8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
