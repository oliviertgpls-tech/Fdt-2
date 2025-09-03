/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // ajoute ici tous les domaines d’images que tu utilises
    domains: ["images.unsplash.com"],
    // ou utilise remotePatterns si tu veux être plus précis
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "images.unsplash.com",
    //     pathname: "/**",
    //   },
    // ],
  },
};

module.exports = nextConfig;
