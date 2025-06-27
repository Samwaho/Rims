import {withSentryConfig} from "@sentry/nextjs";
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
      {
        protocol: "https",
        hostname: "ucarecdn.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
    ],
    domains: ["uploadthing.com", "utfs.io", "ucarecdn.com", "images.unsplash.com"],
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  // Add this configuration for Server Actions
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', 'w06z1rvh-80.inc1.devtunnels.ms'],
    },
  },
};

export default withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "jara-wheels",
    project: "rims-frontend",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from the client-side (increases bundle size)
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
