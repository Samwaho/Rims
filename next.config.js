/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: [
      "your-image-domains-here",
      "uploadthing.com",
      "utfs.io",
      "ucarecdn.com",
    ],
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
    serverActions: true,
  },
};

module.exports = nextConfig;
