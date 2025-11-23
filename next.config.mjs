/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
    ],
  },
  // Optimize compilation speed
  reactStrictMode: false, // Disable double rendering in dev
  compiler: {
    removeConsole: false, // Keep console logs in development
  },
  // Optimize webpack for faster builds
  webpack: (config, { dev }) => {
    // Speed up webpack compilation in development
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      }
      // Reduce the number of modules webpack needs to process
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      }
    }
    return config
  },
  // Enable experimental features for faster compilation
  experimental: {
    optimizePackageImports: ['lucide-react', '@/components/ui'], // Optimize imports
    turbo: {
      // Turbopack-specific optimizations
      resolveAlias: {
        canvas: false, // Exclude heavy dependencies
      },
    },
  },
}

export default nextConfig


