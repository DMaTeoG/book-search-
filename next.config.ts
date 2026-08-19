import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Si usas versiones de Next.js donde esta opción aún está dentro de experimental
  },
  // Agrega las IPs desde las que accedes a tu servidor local
  allowedDevOrigins: ['192.168.56.1', 'localhost:3000', '127.0.0.1:3000'],
};

export default nextConfig;