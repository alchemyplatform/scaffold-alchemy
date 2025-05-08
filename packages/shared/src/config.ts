import dotenv from "dotenv";
import path from "path";

// load workspace-specific .env first
const workspaceEnvPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: workspaceEnvPath });

// to load root .env as fallback, do not override existing values
const rootEnvPath = path.resolve(process.cwd(), "../../.env");
dotenv.config({ path: rootEnvPath, override: false });

export const ALCHEMY_CONFIG = {
  ALCHEMY_GAS_POLICY_ID:
    process.env.ALCHEMY_GAS_POLICY_ID || "f0d2920d-b0dc-4e55-ab21-2fcb483bc293",
  ALCHEMY_API_KEY:
    process.env.ALCHEMY_API_KEY || "Aau4vg0U-46T4ZI857caO7otLxX3RVSo",
} as const;

export type AlchemyConfig = typeof ALCHEMY_CONFIG;
