import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2e6',
          100: '#cce6cc',
          200: '#99cc99',
          300: '#66b366',
          400: '#339933',
          500: '#008000', // WebFix Green
          600: '#006600',
          700: '#004d00',
          800: '#003300',
          900: '#001a00',
        },
        ink: {
          50: '#f9f9f9',
          100: '#f2f2f2',
          200: '#e6e6e6', // Borders
          300: '#cccccc',
          400: '#b3b3b3',
          500: '#999999',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333', // Secondary text
          900: '#1a1a1a', // Primary text
        },
        surface: '#ffffff',
        background: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'none': 'none',
      },
    },
  },
  plugins: [],
};
export default config;
