/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#F48221", // Natura Orange (Main Brand Color)
        "whatsapp": "#25D366", // WhatsApp Green
        "beauty-pink": "#FF8DA1",
        "beauty-soft": "#FFF0F3",
        "background-light": "#FDFCFD",
        "background-dark": "#112114",
        "natura-orange": "#F48221",
        "accent-teal": "#00A99D",
        "accent-pink": "#E3007E",
        "primary-old": '#FF6600',
        "bio": '#4A7729',
        "sophistication": '#5E4B8B',
        "background": '#F9F9F9',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
}
