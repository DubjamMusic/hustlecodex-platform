const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: output: 'export' is removed to support API routes for decision loop
  // If you need static export, you'll need to disable the decision API
  trailingSlash: false,
  images: {
    unoptimized: true,
    domains: ['hustlecodex.com', 'localhost'],
  },
  compress: true,
  poweredByHeader: false,
};

module.exports = withPWA(nextConfig);
