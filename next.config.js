/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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