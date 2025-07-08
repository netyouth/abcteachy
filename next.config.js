/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production builds to succeed even if there are type errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow production builds to succeed even if there are ESLint errors
    ignoreDuringBuilds: false,
  },
  images: {
    domains: [
      'orwybezmxvlgenhvwqhj.storage.supabase.co',
    ],
  },
  // Support for custom path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': new URL('./src', import.meta.url).pathname,
    };
    return config;
  },
};

export default nextConfig; 