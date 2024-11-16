/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploadthing.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
    domains: ["uploadthing.com", "utfs.io"],
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
