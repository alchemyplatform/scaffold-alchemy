import dotenv from "dotenv";
import path from "path";
import chainConfigJson from "../config/chainConfig.json";
import defaultKeysJson from "../config/defaultKeys.json";

// local .env takes precedence
const workspaceEnvPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: workspaceEnvPath });

const rootEnvPath = path.resolve(process.cwd(), "../../.env");
dotenv.config({ path: rootEnvPath, override: false });

interface ChainConfig {
  mainnetName: string;
  mainnetChainId: number;
  testnetChainId: number;
  testnetChainName: string;
}

interface AlchemyConfig {
  ALCHEMY_GAS_POLICY_ID: string;
  ALCHEMY_API_KEY: string;
}

export const chainConfig: ChainConfig = chainConfigJson;

// Merge environment variables with default keys, preferring env vars
export const alchemyConfig: AlchemyConfig = {
  ALCHEMY_GAS_POLICY_ID: process.env.ALCHEMY_GAS_POLICY_ID || defaultKeysJson.ALCHEMY_GAS_POLICY_ID,
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || defaultKeysJson.ALCHEMY_API_KEY,
};

// Export individual values for convenience
export const { mainnetName, mainnetChainId, testnetChainId, testnetChainName } = chainConfig;

export const { ALCHEMY_GAS_POLICY_ID, ALCHEMY_API_KEY } = alchemyConfig;
