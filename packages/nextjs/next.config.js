// @ts-check
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if we are in development mode
const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  const rootEnvPath = path.resolve(__dirname, "../../.env");
  const localEnvPath = path.resolve(__dirname, ".env");
  dotenv.config({ path: rootEnvPath });
  dotenv.config({ path: localEnvPath });
}

const defaultKeys = JSON.parse(fs.readFileSync(path.resolve(__dirname, "config", "defaultKeys.json"), "utf8"));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  env: {
    // Alchemy config (server-side only)
    ALCHEMY_GAS_POLICY_ID: process.env.ALCHEMY_GAS_POLICY_ID || defaultKeys.ALCHEMY_GAS_POLICY_ID,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || defaultKeys.ALCHEMY_API_KEY,
  },
};

export default nextConfig;
