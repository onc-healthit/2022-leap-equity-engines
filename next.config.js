/** @type {import('next').NextConfig} */
const withImages = require("next-images");
const nextConfig = {
  reactStrictMode: true,
  images: {
    disableStaticImages: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.txt$/,
      type: "asset/source",
    });
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = withImages(nextConfig);
