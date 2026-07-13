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
          200: "#e6e3dc",   // bordi/divisori
        },
        ink: {
          700: "#2f2a26",   // testo principale (mai nero puro: più caldo, coerente con brand)
          500: "#6b6259",   // testo secondario
        },
        // Stato di maturazione: stessa famiglia calda della palette, non colori a caso.
        status: {
          young:   "#7a8f99",  // giovane — freddo/neutro, "non ancora"
          almost:  "#c7773a",  // quasi pronto — brand-500
          ready:   "#5f8a5a",  // pronto ora — verde muto, non un verde semaforo acceso
          decline: "#a9463a",  // in declino — rosso/mattone caldo, coerente con la palette
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