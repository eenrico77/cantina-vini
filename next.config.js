/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@imgly/background-removal', 'onnxruntime-web'],
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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "onnxruntime-node": false,
      };
    }
    
    // Fix per i file .mjs di onnxruntime e imgly
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

export default nextConfig;