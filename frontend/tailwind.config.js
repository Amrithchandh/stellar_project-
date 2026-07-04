/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d6a4f',
          light: '#40916c',
          dark: '#1b4332',
        },
        accent: {
          gold: '#fff3b0',
          amber: '#e09f3e',
          red: '#d93025',
          blue: '#1a73e8',
        }
      },
    },
  },
  plugins: [],
};
