/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        // Dominio di Supabase Storage, dove salviamo le foto reali/da catalogo
        // delle etichette (bucket "wine-images"). Senza questa riga next/image
        // blocca l'immagine e mostra l'icona rotta.
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Le foto scattate da telefono spesso superano il limite di default
      // (1MB) di Next.js per i Server Actions, causando un errore silenzioso
      // durante l'upload dell'etichetta.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;