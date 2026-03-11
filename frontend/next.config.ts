import type { NextConfig } from "next";
import path from "path";

const defaultBackendUrl =
  process.env.NODE_ENV === "production"
    ? "http://backend.railway.internal"
    : "http://127.0.0.1:18080";

const backendUrl =
  process.env.INTERNAL_API_BASE_URL?.replace(/\/api\/?$/, "") ?? defaultBackendUrl;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, ".."),
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.local", "10.*", "172.*", "192.168.*"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
