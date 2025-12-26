import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        accent: '#f97316',
        surface: '#0f172a'
      }
    }
  },
  plugins: []
};
export default config;
