import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FF5A00',
        'primary-dark': '#E64F00',
        price: '#FF3333',
        success: '#00B365',
        vip: '#D4AF37',
        background: '#F5F5F5',
        card: '#FFFFFF',
        text: {
          primary: '#333333',
          secondary: '#666666',
          muted: '#999999',
        },
        border: {
          light: '#E5E5E5',
          DEFAULT: '#DDDDDD',
        },
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
        heading: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
