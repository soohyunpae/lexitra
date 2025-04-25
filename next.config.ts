import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, 
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  env: {
    BASE_URL: process.env.BASE_URL,
  },
};

export default nextConfig;