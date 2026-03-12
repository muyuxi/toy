import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#000000',
        background: '#FFFFFF',
        text: '#000000',
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
        heading: ['Rubik', 'sans-serif'],
      },
      borderRadius: {
        'clay': '20px',
      },
      boxShadow: {
        'clay': '0 4px 0 0 rgba(0,0,0,0.1), 0 8px 16px -4px rgba(0,0,0,0.1)',
        'clay-sm': '0 2px 0 0 rgba(0,0,0,0.1), 0 4px 8px -2px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
