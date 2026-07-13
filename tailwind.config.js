// tailwind.config.js
module.exports = {
content: [
  "./app/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#faf5ef",
          100: "#f3e3cf",
          200: "#e4c4a2",
          400: "#d49461",
          500: "#c7773a",   // colore principale (bottone/tab attiva)
          600: "#a95f2a",
        },
        sand: {
          50:  "#f9f8f6",   // sfondo app
          100: "#f1f0ec",   // card chiare
        },
      },
      borderRadius: {
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15,23,42,0.08)', // ombra morbida tipo iOS
      },
    },
  },
  plugins: [],
};