// @ts-check
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const rootEnvPath = path.resolve(__dirname, "../../.env");
const localEnvPath = path.resolve(__dirname, ".env");

// Load root .env first, then local .env (which will override root values)
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: localEnvPath });

// Load common configuration files
const chainConfigPath = path.resolve(__dirname, "../../common/chainConfig.json");
const defaultKeysPath = path.resolve(__dirname, "../../common/defaultKeys.json");

const chainConfig = JSON.parse(fs.readFileSync(chainConfigPath, "utf8"));
const defaultKeys = JSON.parse(fs.readFileSync(defaultKeysPath, "utf8"));

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
    // Chain config (public)
    NEXT_PUBLIC_MAINNET_NAME: chainConfig.mainnetName,
    NEXT_PUBLIC_MAINNET_CHAIN_ID: String(chainConfig.mainnetChainId),
    NEXT_PUBLIC_TESTNET_CHAIN_ID: String(chainConfig.testnetChainId),
    NEXT_PUBLIC_TESTNET_CHAIN_NAME: chainConfig.testnetChainName,

    // Alchemy config (server-side only)
    ALCHEMY_GAS_POLICY_ID: process.env.ALCHEMY_GAS_POLICY_ID || defaultKeys.ALCHEMY_GAS_POLICY_ID,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || defaultKeys.ALCHEMY_API_KEY,
  },
};

export default nextConfig;
