/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: { exclude: ['error'] },
  },
};

export default nextConfig;
