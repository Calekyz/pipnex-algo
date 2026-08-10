/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
    ],
  },
  // Allow Node.js built-in modules in server-side code
  serverExternalPackages: ['fs', 'path', 'prisma', '@prisma/client'],
};

export default nextConfig;
